import { Injectable } from '@nestjs/common';
import { ContactService } from './contacts.service';
import { OpenAI } from "langchain/llms/openai";
import { APIChain } from 'langchain/chains';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { JsonSpec, JsonObject } from "langchain/tools";
import { createOpenApiAgent, OpenApiToolkit } from "langchain/agents";

// type to specify the age group of the party
type AgeGroup = "kids" | "teens" | "young adults" | "adults" | "seniors";
type Exclusivity = "Guys only" | "Girls only" | "Mixed"

@Injectable()
export class AppService {
  llm: OpenAI;
  constructor(private contactsSvc: ContactService) {
   this.llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo"
    });
  }


  async getThemes(ageGroups: AgeGroup[] = [], exclusivity: Exclusivity = "Mixed") {
    const prompt = `
    Generate a list of 10 party themes that are acceptable by Jehovah's Witnesses. The themes should be:

    Not objectionable by Jehovah's Witnesses' beliefs and values

    Keep the themes relevant to the size of the party and the age of the group.
    The party should be for ${ageGroups.length > 0 ? ageGroups.join(", ") : "all ages"}.
    ${exclusivity != "Mixed" ? `The party is for ${exclusivity}.` : ""}

    The AI model should generate themes that are creative and engaging.
    The AI model should generate themes that are appropriate and relevant for the age group of the party guests, and the exclusivity of the party.
    The AI model can use a party referencing an ira such as 70's dress up party, or a party referencing a movie.

    return the result as a JSON string without any other text.
    the JSON must be valid and must conform to the following structure:
    {"themes": [{"name" : "the party theme", "description": "a very shorty description of the party theme"} , ...]}`

    const response = await this.llm.call(prompt);
    const result = JSON.parse(response);
    return result.themes;
  }


  async generatePartyPlans(theme: string, guests: {name: string, email: string}[]) {
    const prompt = `
    Generate a plan for a party with the theme "${theme}" , the plan should be:

    Include a very simple and fun list of activities to do at the party, make the list proportionate to the number of people invited and the age of the group, do not include any activities that are objectionable by Jehovah's Witnesses' beliefs and values.
    Include a simple list of things to bring to the party, food, drinks, and other things needed for the party based on the theme make the list proportionate to the number of people invited and assign who is bringing what to the party, be specific and fair, here is a list of the guests:

    ${guests.map(guest => `${guest.name} (email: ${guest.email})`).join("\n")}

    The size of the party is ${guests.length} guests.
    The response should be a string that looks like this:
    Party Plan for ${theme}:
    Things to do:
    - thing 1
    - thing 2

    Things to bring:
    - thing 1: guest 1 (email: guest 1 email)
    - thing 2: guest 2 (email: guest 2 email)
    - thing 3: guest 3 (email: guest 3 email)
    `

    const response = await this.llm.call(prompt);
    return response;
  }



  async sendInvitations(plan: string, dateTime: string, guests: {name: string, email: string}[]) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SG_API_KEY}`,
    };
    this.llm.temperature = 0; // this value is between 0 and 1, the higher the value the more creative the response is.

    const specs = {
        "openapi": "3.1.0",
        "info": {
            "title": "Twilio SendGrid v3 API",
            "description": "The Twilio SendGrid v3 API provides a simple, intuitive RESTful-like interface for sending email at scale, monitoring email engagement data programmatically, managing account settings, and more. This OpenAPI representation of the Twilio SendGrid v3 API allows you to generate helper libraries (in addition to the libraries officially released by Twilio SendGrid) and build mock servers for testing.",
            "termsOfService": "https://www.twilio.com/legal/tos",
            "contact": {
                "name": "Twilio SendGrid Support",
                "url": "https://support.sendgrid.com/hc/en-us"
            },
            "license": {
                "name": "MIT",
                "url": "https://github.com/sendgrid/sendgrid-oai/blob/main/LICENSE"
            },
            "version": "1.8.1"
        },
        "servers": [
            {
                "url": "https://api.sendgrid.com",
                "description": "The Twilio SendGrid Production API."
            }
        ],
        "paths": {
            "/v3/mail/send": await this._loadOpenApiSpec(
              "https://raw.githubusercontent.com/sendgrid/sendgrid-oai/main/spec/paths/mail_send/mail_send.json"
            ),
          },
        } as JsonObject;

    const toolkit =  new OpenApiToolkit(new JsonSpec(specs), this.llm, headers);

    const executor = createOpenApiAgent(this.llm, toolkit);
    executor.verbose = true;

    const prompt = `
    given the following party plan:
    ${plan}
    date and time: ${dateTime}
    guest list: ${guests.map(guest => `${guest.name} (email: ${guest.email})`).join("\n")}
    send emails to each of the guest with the party plan as the content of the email, each guest should receive an email.
    all the emails should be sent at the same time.
    the email should be sent to each guest's email address.
    the email should be sent from the email address of the party host which is: R. Alhawash <ralhawash@thesmythgroup.com>
    the email should have the subject which is based on the party theme and the date.
    `

    const result = await executor.call({input: prompt});
    console.log(`Got output ${result.output}`);
    return result.output;
  }


  private async _loadOpenApiSpec(url): Promise<JsonObject> {
    const loader = new CheerioWebBaseLoader(url);
    const spec = (await loader.load()).pop().pageContent;
    return JSON.parse(spec).mail_send;
  }

}
