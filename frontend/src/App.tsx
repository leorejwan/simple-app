import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  const [allPhotos, setAllPhotos] = useState([]);
  const baseUri: string = process.env.REACT_APP_API_URL!;

  useEffect(() => {
    async function fetchPhotos() {
      const { data } = await axios.get(`${baseUri}getAllPhotos`);
      setAllPhotos(JSON.parse(data.body));
    }

    fetchPhotos();
  }, [baseUri]);


  function getCarouselImage(photo: any, index: any) {
    return (
      <Carousel.Item interval={1000} style={{ height: 350 }} key={index}>
        <img src={photo.url} alt={photo.filename} className='h-100' />
        <Carousel.Caption>
          <h3 style={{ backgroundColor: 'rgba(0,0,0,.3)' }}>
            {photo.filename}
          </h3>
        </Carousel.Caption>
      </Carousel.Item>
    );
  }
  return (
    <div className='App bg-secondary min-vh-100'>
      <h1 className='display-3 p-3 mb-5'>Super Mario and friends</h1>
      <Carousel>{allPhotos.map((photo, index) => getCarouselImage(photo, index))}</Carousel>
    </div>
  );
}

export default App;