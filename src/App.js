import React, { useState, useEffect } from 'react';
import './App.css';
import { Stomp } from '@stomp/stompjs';
import image from "./image.avif";
import live from "./live.gif";

function App() {
  const [greetings, setGreetings] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectToWebSocket = () => {
      const stomp = Stomp.client('ws://192.168.1.10:8080/live-object-count');

      const onConnect = frame => {
        setIsConnected(true);
        stomp.subscribe('/topic/object-count', greeting => {
          const newGreeting = JSON.parse(greeting.body);
          setGreetings(prevGreetings => ({ ...prevGreetings, ...newGreeting }));
        });
      };

      const onWebSocketError = error => {
        console.error('Error with websocket', error);
        setIsConnected(false);
        setTimeout(connectToWebSocket, 5000);
      };

      const onWebSocketClose = () => {
        setIsConnected(false);
        setTimeout(connectToWebSocket, 5000); 
      };

      const onStompError = frame => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setIsConnected(false);
        setTimeout(connectToWebSocket, 5000);
      };

      stomp.onConnect = onConnect;
      stomp.onWebSocketError = onWebSocketError;
      stomp.onWebSocketClose = onWebSocketClose;
      stomp.onStompError = onStompError;

      stomp.activate();

      return () => {
        stomp.deactivate();
        setIsConnected(false);
      };
    };

    connectToWebSocket();
  }, []);

  return (
    <div className="app">
      <img className="background-image" src={image} alt="" />
      {isConnected &&
        <img className='LiveContainer' src={live} alt=''/>
      }
      <div className="boxContainer">
        <div className="box">
          <div className='boxHeader'>Object</div>
          <div className='boxBody'>{greetings.object ? greetings.object.name.toUpperCase() : "N/A"}</div>

        </div>
        <div className="box">
          <div className='boxHeader'>Count</div>
          <div className='boxBody'>{greetings.count != null ? greetings.count : "N/A"}</div>
        </div>
      </div>
    </div>
  );
}

export default App;