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
  const [invitees, setInvitees] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    const fetchOptions = async () => {
      // TODO: Get API URL to fetch party themes.
      const url = '';

      if (themeOptions.length < 1) {
        // TODO: Call API to set options
        // const res = await axios.get(url);
        // if (res?.data) {
        //   setThemeOptions(res.data.options);
        // }

        const options: Option[] = [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
          { label: 'Option 3', value: 3 },
        ];
        setThemeOptions(options);
      }
    };
    fetchOptions().catch(console.error);
  }, [themeOptions]);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.currentTarget.name) {
      case 'location':
        setLocation(e.currentTarget.value);
        break;
      case 'invitees':
        setInvitees(e.currentTarget.value);
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
    setInvitees('');
    setTheme(null);
    setDate(new Date());
    setLocation('');

    setIsPreview(false);
  };

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
                <p className="pb-8">{invitees}</p>

                <p>Theme:</p>
                <p className="pb-8">{theme?.label}</p>

                <p>Date:</p>
                <p className="pb-8">
                  {formatISO(date, { representation: 'date' })}
                </p>

                <p>Location:</p>
                <p className="pb-8">{location}</p>
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
              <InputComponent
                inputName={'invitees'}
                label={'Enter email addresses of your invitees'}
                onChange={changeHandler}
                type={InputComponentType.textArea}
                value={invitees}
              />
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
