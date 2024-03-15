import { useEffect, useState } from 'react';
import { getLocations, isNameValid } from './mock-api/apis';
import { v4 as uuidv4 } from 'uuid';

import './App.css';

const ZERO = 0;
const FIVE = 5;

function App() {
  const [name, setName] = useState();
  const [location, setLocation] = useState();
  const [invalidNameMessage, setInvalidNameMesaage] = useState(false);
  const [isTableFull, setIsTableFull] = useState(false);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState([]);
  let timer = null;

  useEffect(() => {
    fetchLocations();

    // Setting initial data to render empty table based on design
    setInitialFormData();
  }, []);

  const setInitialFormData = () => {
    const initialFormData = [];

    for (let i = ZERO; i < FIVE; i++) {
      initialFormData.push({});
    }

    setFormData(initialFormData);
  };

  const fetchLocations = async () => {
    const locations = await getLocations();

    setLocations(locations);

    // Based on the design, Canada is always the first option
    // so I have it set automatically as the first option
    setLocation(locations[0]);
  };

  const onChangeName = ({ target: { value } }) => {
    setName(value);
    // For cases when error message renders, remove message when
    // user starts typing again

    setInvalidNameMesaage(null);

    // Adding debouncing for performance and better user experience
    // Used 50ms as it seems to be a good time
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const valid = await isNameValid(value);

      if (!valid) {
        setInvalidNameMesaage('this name has already been taken');
      }
    }, 50);
  };

  const onLocationChange = ({ target: { value } }) => setLocation(value);

  const onAdd = () => {
    // For better experience, only allow name and location to be 
    // added if name is provided
    if (!name) {
      setInvalidNameMesaage('name cannot be empty');
    } else {
      // Based on the mock up that the table is fixed with five rows,
      // I assumed there will always only be five rows. Thus, the reason
      // why I insert data in this way.
      // This is alway why I made the "clear" button to clear all
      // existing data in the table
      const index = formData.findIndex((item) => Object.keys(item).length === 0);

      if (index !== -1) {
        const newData = { name, location };

        formData.splice(index, 1, newData);
        setFormData(formData);
      } else {
        setIsTableFull(true);
      }

      setName('');
      setLocation(locations[0]);
    }
  };

  const onClear = () => {
    // As an edge case, aside from clearing all existing data in the
    // table as per reason above, I'm also clearing other error
    // messages and input as to restart the form
    setName('');
    setInvalidNameMesaage(null);
    setLocation(locations[0]);
    setIsTableFull(false);
    setInitialFormData();
  }

  return (
    <div className='App'>
      <form className='form'>
        <div>
          <label htmlFor='name'>Name</label>
          <input
            id='name'
            type='text'
            onChange={onChangeName}
            value={name}
            required
          />
          {
            invalidNameMessage && (
              <p className='nameError'>{invalidNameMessage}</p>
            )
          }
        </div>
        <div>
          <label htmlFor='location'>Location</label>
          <select
            id='location'
            onChange={onLocationChange}
            value={location}
            required
          >
            {
              locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))
            }
          </select>
        </div>
        <div className='controller'>
          <button type='button' onClick={onClear}>Clear</button>
          <button type='button' onClick={onAdd}>Add</button>
        </div>
      </form>
      <table>
        <tr>
          <th width='45%'>Name</th>
          <th>Location</th>
        </tr>
        {
          // Default name and location value to render
          // initial empty table
          formData.map(({ name = '', location = '' }) => (
            <tr key={uuidv4()}>
              <td>{name}</td>
              <td>{location}</td>
            </tr>
          ))
        }
      </table>
      {
        isTableFull && (
          <p className='tableFullError'>
            Table is full. Please clear and add new data.
          </p>
        )
      }
    </div>
  );
}

export default App;
