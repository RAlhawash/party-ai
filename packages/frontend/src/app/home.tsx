import Select from 'react-select';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { formatISO } from 'date-fns';

import 'react-datepicker/dist/react-datepicker.css';
import InputComponent, { InputComponentType } from './input';

export function HomePage() {
  interface Option {
    label: string;
    value: number;
  }

  interface Contact {
    id: number;
    name: string;
    email: string;
    value?: boolean;
  }

  interface FormElements extends HTMLFormControlsCollection {
    invitees: HTMLInputElement;
    theme: HTMLInputElement;
    date: HTMLInputElement;
    location: HTMLInputElement;
  }

  interface PartyForm extends HTMLFormElement {
    readonly elements: FormElements;
  }

  const [isPreview, setIsPreview] = useState<boolean>(false);

  // The party themes.
  const [themeOptions, setThemeOptions] = useState<Option[]>([]);
  const [theme, setTheme] = useState<Option | null>(null);

  // The party date.
  const [date, setDate] = useState<Date>(new Date());
  // const [invitees, setInvitees] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [location, setLocation] = useState<string>('');

  const [plan, setPlan] = useState<string>('');

  useEffect(() => {
    const fetchContacts = async () => {
      // TODO: Get API URL to fetch party themes.
      const url = 'http://localhost:3000/api/contacts';

      const res = await axios.get(url);
      if (res?.data) {
        // setContacts(res.data.options);
        // loop through the data and set the options
        const contacts: Contact[] = res.data.map((contact: Contact) => {
          return {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            value: true,
          };
        });
        setContacts(contacts);
      }
    };
    fetchContacts().catch(console.error);
  }, [contacts]);

  useEffect(() => {
    const fetchOptions = async () => {
      const url = 'http://localhost:3000/api/themes';

      if (themeOptions.length < 1) {
        // TODO: Call API to set options
        const res = await axios.get(url);
        if (res?.data) {
          // loop through the data and set the options
          const options: Option[] = res.data.map(
            (theme: any, index: number) => {
              return {
                label: theme.name,
                value: index + 1,
                description: theme.description,
              };
            }
          );
          setThemeOptions(options);
        }
      }
    };
    fetchOptions().catch(console.error);
  }, [themeOptions]);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.currentTarget.name) {
      case 'location':
        setLocation(e.currentTarget.value);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent<PartyForm>) => {
    e.preventDefault();

    const target = e.currentTarget.elements;

    const invitees = target.invitees?.value;
    const theme = target.theme?.value;
    const date = target.date?.value;
    const location = target.location?.value;

    const submitData = {
      invitees,
      theme,
      date,
      location,
    };

    setIsPreview(true);
  };

  const resetForm = () => {
    // Reset field values
    setTheme(null);
    setDate(new Date());
    setLocation('');

    setIsPreview(false);
  };

  const [checkedAll, setCheckedAll] = useState(true);

  return (
    <div className="container mx-auto p-24 text-slate-600">
      <h1 className="text-7xl font-bold text-center">TSG Party AI</h1>
      {isPreview ? (
        <div>
          {/* Preview Result */}
          <section className="grid grid-cols-2 my-24 bg-slate-100 rounded-md p-8 shadow-xl">
            <h2 className="flex items-center text-5xl font-bold">
              Preview Result
            </h2>
            <div>
              <h3 className="pb-8 text-3xl font-bold">
                Here is the invitation that will be sent:
              </h3>
              <div className="grid grid-cols-2 text-lg">
                <p>Guests:</p>
                <div className="pb-8">
                  {contacts?.map((contact, i) => {
                    return (
                      <div key={i} className="text-lg ">
                        <label className="">{contact.name}</label>
                      </div>
                    );
                  })}
                </div>

                <p>Theme:</p>
                <p className="pb-8">{theme?.label}</p>

                <p>Date:</p>
                <p className="pb-8">
                  {formatISO(date, { representation: 'date' })}
                </p>

                <p>Location:</p>
                <p className="pb-8">{location}</p>

                <p>Plan:</p>
                <p className="pb-8">{plan}</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2">
            <button
              onClick={(e) => setIsPreview(false)}
              className="mx-auto px-16 py-4 rounded-md shadow-sm bg-slate-700 hover:bg-slate-800 text-white text-3xl font-bold"
            >
              Back
            </button>
            <button
              onClick={resetForm}
              className="mx-auto px-16 py-4 rounded-md shadow-sm bg-slate-700 hover:bg-slate-800 text-white text-3xl font-bold"
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Who */}
          <section className="grid grid-cols-2 my-24 bg-slate-100 rounded-md p-8 shadow-xl">
            <h2 className="flex items-center text-5xl font-bold">
              Step 1: Who
            </h2>
            <div>
              {/* <InputComponent
                inputName={'invitees'}
                label={'Enter email addresses of your invitees'}
                onChange={changeHandler}
                type={InputComponentType.textArea}
                value={invitees}
              /> */}
              <div className="text-lg">
                <input
                  id="selectAll"
                  type="checkbox"
                  className="mr-4"
                  checked={checkedAll}
                  onChange={(event) => setCheckedAll(event.target.checked)}
                />
                <label htmlFor={'selectAll'} className="">
                  Select All
                </label>
              </div>
              {contacts?.map((contact, i) => {
                return (
                  <div key={i} className="text-lg ">
                    <input
                      id={`contact-${i}`}
                      type="checkbox"
                      className="mr-4"
                      checked={contact.value}
                      onChange={() => (contact.value = !contact.value)}
                    />
                    <label htmlFor={`contact-${i}`} className="">
                      {contact.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          {/* What */}
          <section className="grid grid-cols-2 my-24 bg-slate-100 rounded-md p-8 shadow-xl">
            <h2 className="flex items-center text-5xl font-bold">
              Step 2: What
            </h2>
            <div>
              <label className="flex text-xl pb-4 font-bold">
                Select a theme for your party
              </label>
              <Select
                name="theme"
                options={themeOptions}
                onChange={(e) => setTheme(e)}
                value={theme}
              />
            </div>
          </section>

          {/* When */}
          <section className="grid grid-cols-2 my-24 bg-slate-100 rounded-md p-8 shadow-xl">
            <h2 className="flex items-center text-5xl font-bold">
              Step 3: When
            </h2>
            <div>
              <label className="flex text-xl pb-4 font-bold">
                Select a date for your party
              </label>
              <DatePicker
                id="date"
                selected={date}
                onChange={(date: Date) => setDate(date)}
                minDate={new Date()}
              />
            </div>
          </section>

          {/* Where */}
          <section className="grid grid-cols-2 my-24 bg-slate-100 rounded-md p-8 shadow-xl">
            <h2 className="flex items-center text-5xl font-bold">
              Step 4: Where
            </h2>
            <div>
              <InputComponent
                inputName={'location'}
                label={'Enter a location for your party'}
                onChange={changeHandler}
                type={InputComponentType.textArea}
                value={location}
              />
            </div>
          </section>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-16 py-4 rounded-md shadow-sm bg-slate-700 hover:bg-slate-800 text-white text-3xl font-bold"
            >
              Preview
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default HomePage;
