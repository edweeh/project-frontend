// Home1.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './Home.css';
import NavBar from './Navbar';
import baseUrl from '../../Api';
import { useSpring } from 'react-spring';
import SearchBar from './Searchbar';
import Imgslider from './Imgslider';
import Footer from './Footer';
// import FavoriteIcon from '@mui/icons-material/Favorite';

const Home1 = () => {
  const [petList, setPetList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [trigger,setTrigger] = useState(false);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const getToken = () => {
        return localStorage.getItem('token');
    };

    const token = getToken();
    if (!token) {
        navigate('/login');
    } else {
        console.log('Token fetched:', token);
        const payload = token.split('.')[1];
        console.log('Token Payload:', payload); // Log the token payload for debugging
        try {
            const decodedPayload = atob(payload);
            console.log('Decoded Payload:', decodedPayload); // Log the decoded payload for debugging
            
            // Extract 'id' as 'userId' and 'username' from decoded payload
            const { id: userId, username: decodedUsername } = JSON.parse(decodedPayload);
            console.log('User Id:', userId); // Log the extracted user ID for debugging
            console.log('Username:', decodedUsername); // Log the extracted username for debugging
            
            // Set the extracted username to the state variable
            setUsername(decodedUsername);
            setUserId(userId);
            // Optionally, you can also set the email state variable if it's available in the payload
            // setEmail(decodedEmail);

            // Make the Axios request to fetch pet data
            axios
                .get(baseUrl + '/pet/tfetch')
                .then((response) => {
                    setPetList(response.data);
                })
                .catch((err) => console.log(err));
        } catch (error) {
            console.error('Error decoding token payload:', error);
        }
    }
}, []);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get(baseUrl + `/pet/tsearch/${searchTerm}`);
        setPetList(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    // Fetch pets only if searchTerm is not empty
    if (searchTerm !== '') {
      fetchPets();
    } else {
      // If search term is empty, fetch all pets
      axios.get(baseUrl + '/pet/tfetch')
        .then((response) => {
          setPetList(response.data);
        })
        .catch((err) => console.log(err));
    }
  }, [searchTerm]);

  const handleAddToCart = (pet) => {
    setTrigger(!trigger);
    axios
      .post(baseUrl + `/cart/addcart`, { Petcode: pet.Petcode, userId }) // Include userId when adding to cart
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => console.log(err));
  };

  const [hover, setHover] = useState(false);

  const scaleProps = useSpring({
    transform: hover ? 'scale(1.1)' : 'scale(1)',
  });

  return (
    <div className="home-page">
      <NavBar trigger={trigger}/>
      <Imgslider />

      <div className="welcome-section">
        <h1>Welcome {username} to PAWSHUB</h1>
        <p>Find your new furry friend with us!</p>
      </div>

      <div className="featured-pets-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h2>Featured Pets</h2>
        <div className="featured-pets">
          {petList ? (
            petList.map((pet) => (
              <div key={pet.id} className="featured-pet-card" >
                {/* <Link to="/Fav" className="favorites-icon-link">
                  <FavoriteIcon className="favorites-icon" style={{position:'absolute',marginTop:'20px',marginLeft:'60px'}}/>
                </Link> */}
                <img  style={{ height: '270px', width: 'auto', marginTop: '10px' }} src={`data:${pet.Image.contentType};base64,${pet.Image.data}`} alt="petImage" />
                <h3>{pet.PetName}</h3>
                <p>{pet.Breed}</p>
                <div className="button-container">
                  <Link to={{ pathname: `/pet/${pet.Petcode}`, state: { pet } }}>
                    <button className="view-details-button">View Details</button>
                  </Link>
                  <button
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(pet)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Home1;
