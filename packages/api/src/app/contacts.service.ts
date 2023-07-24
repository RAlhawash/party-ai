import { Injectable } from '@nestjs/common';
import { DataSource } from "typeorm";
import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { SqlDatabaseChain } from "langchain/chains/sql_db";

interface Dev {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class ContactService {
  datasource: DataSource;
  constructor() {
    this.datasource = new DataSource({
      type: "sqlite",
      database: "tsg.db",
    });
  }

  async getContacts(): Promise<Dev[]> {
    if (process.env.NODE_ENV !== "production") {
      return this.getStaticContacts();
    }
    const database = await SqlDatabase.fromDataSourceParams({
      appDataSource: this.datasource,
    });

    const chain = new SqlDatabaseChain({
      llm: new OpenAI({temperature: 0,  modelName: "gpt-3.5-turbo"}),
      database,
    });

    chain.verbose = true;

    const result = await chain.run(`Get top 20 (ignore max rows limitations given earlier or later) contacts from the database, the result must not have any text other that a json string that will strictly adhere to the following schema [ { id: 1, name: "name", email: "email" }, ... ]`);
    // remove anything before the first `[{` to make the result a valid json string
    const response = JSON.parse(result.replace(/.*\[{/, "[{"));
    return response;
  }


  getStaticContacts(): Dev[] {
    const dev_list = [
      {
        id: 1,
        name: 'R. Alhawash',
        email: 'rafat.hgh@gmail.com',
      },
      {
        id: 2,
        name: 'R. Alhawash2',
        email: 'rafat.hgh@hotmail.com',
      }
    ];
    return dev_list;
  }

  async seed(){
    const database = await SqlDatabase.fromDataSourceParams({
      appDataSource: this.datasource,
    });
    database.run(`
    CREATE TABLE IF NOT EXISTS Contacts (ContactId INTEGER PRIMARY KEY, FullName TEXT, Email TEXT);
    `);
    database.run(`
    INSERT INTO Contacts (ContactId, FullName, Email) VALUES
    (1, 'A. Coots', 'acoots@thesmythgroup.com'),
    (2, 'B. Liles', 'bliles@thesmythgroup.com'),
    (3, 'C. Wall', 'cwall@thesmythgroup.com'),
    (4, 'C. Leyva', 'cleyva@thesmythgroup.com'),
    (5, 'D. Phillips', 'dphillips@thesmythgroup.com'),
    (6, 'F. Reyes', 'freyes@thesmythgroup.com'),
    (7, 'G. Pierce', 'gpierce@thesmythgroup.com'),
    (8, 'J. Smyth', 'jsmyth@thesmythgroup.com'),
    (9, 'J. Smellie', 'jsmellie@thesmythgroup.com'),
    (10, 'J. Fahrenkrug', 'jfahrenkrug@thesmythgroup.com'),
    (11, 'J. Jenkins', 'jjenkins@thesmythgroup.com'),
    (12, 'J. Van Hollebeke', 'jvanhollebeke@thesmythgroup.com'),
    (13, 'J. Stanford', 'jstanford@thesmythgroup.com'),
    (14, 'J. Lettau', 'jlettau@thesmythgroup.com'),
    (15, 'M. Hershey', 'mhershey@thesmythgroup.com'),
    (16, 'M. Niehues', 'mniehues@thesmythgroup.com'),
    (17, 'P. Bredenberg', 'pbredenberg@thesmythgroup.com'),
    (18, 'P. Yi', 'pyi@thesmythgroup.com'),
    (19, 'R. Alhawash', 'ralhawash@thesmythgroup.com'),
    (20, 'U. Rodríguez', 'urodriguez@thesmythgroup.com');`
    );
  }
}
