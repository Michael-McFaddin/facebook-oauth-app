import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'; // component that allows for custom styled button
import axios from 'axios';

// Import environment variables
import {APP_ID, APP_TOKEN, APP_SECRET} from './env.json';

// App scopes are requested in the FacebookLogin component props

const Facebook2 = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [longLiveToken, setLongLiveToken] = useState('');
  const [pageTokenInfo, setPageTokenInfo] = useState({});

  // const appId = ''; // this can be found in the App Dashboard
  // const appSecret = ''; // app secret can be found in the app Dashboard/Setting/Basic
  // const redirectUri = 'http%3A%2F%2Flocalhost%3A3000%2F'; // this may be needed for future requests, 
  //set can be set in the App Dashboard/Products/Facebook Login/Settings/Valid OAuth Redirect URIs
  // const appToken = ''; // this is only really needed for checking the token info so far
  // app token can be found here in when logged into your developer account https://developers.facebook.com/tools/accesstoken/

  // gets info on any tokens
  const getTokenInfo = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/debug_token?input_token=${userData.userToken}&access_token=${APP_TOKEN}`,
      method: 'get',
    });
    console.log('token info', response);
  };
  console.log(window);

  // All functionality in one callback from FacebookLogin component
  const responseFacebook = (response) => {
    if (response.status !== 'unknown') {
      console.log('response', response);
      setIsLoggedIn(true);
      setUserData({
        userName: response.name,
        userToken: response.accessToken,
        userId: response.id,
      });
      
      const getPageToken = async () => {
        const longLiveRes = await axios({
          url: `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${response.accessToken}`,
          method: 'get',
        });
        setLongLiveToken(longLiveRes.data.access_token);
        console.log('longLiveRes',longLiveRes);

        const pageTokenRes = await axios({
          url: `https://graph.facebook.com/v10.0/${response.id}/accounts?access_token=${longLiveRes.data.access_token}`,
          method: 'get',
        });

        setPageTokenInfo({
          pageInfo: [pageTokenRes.data],
          pageId: pageTokenRes.data.data[0].id,
          pageToken: pageTokenRes.data.data[0].access_token,
        });  
        console.log('pageTokenRes', pageTokenRes);
      };
      
      getPageToken();
    }
  };

  const logoutFB = () => {
    console.log('log out ran');
    window.FB.logout();
    setIsLoggedIn(false);
  };

  // Final steps, Store the clientBmSuToken in a secure database and use it 
  // for accessing APIs that require a page access token

  //_______________________________________________________________________________________

  // This is a request path that lets the server make request for a long live page token, not working yet
  // const getClientCode = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/v10.0/oauth/client_code?client_id=${appId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}
  //       &access_token=${longLiveToken}`,
  //     method: 'get',
  //   });
  //   setClientCode(response.data);
  //   console.log('client code', response);
  // };

  //________________________________________________________________________________________

  // facebook graph api query to get the page name
  const getName = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/${pageTokenInfo.pageId}?fields=name&access_token=${pageTokenInfo.pageToken}`,
      method: 'get',
    });
    console.log('page name query', response);
  };

  // facebook graph api query to get the pages posts
  const getPosts = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/${pageTokenInfo.pageId}/posts?access_token=${pageTokenInfo.pageToken}`,
      method: 'get',
    });
    console.log('posts query', response);
  };

  console.log('user data', userData);
  console.log('long live token', longLiveToken);
  console.log('Page Token Info', pageTokenInfo);

  return(
    <div>
      <h2>Facebook Login 2</h2>
      <div>
        {isLoggedIn ? 
          <div>
            Welcome {userData.name}<br />
            <button onClick={() => getTokenInfo()}>Get Token info</button><br /><br />
            <button onClick={() => logoutFB()}>Logout of FB</button>
          </div>
          :
          <FacebookLogin 
            appId={APP_ID}
            autoLoad={false}
            scope="read_insights,pages_show_list,pages_read_engagement,pages_read_user_content,public_profile" // tried on second test user
            callback={responseFacebook}
            render={renderProps => (
              <button onClick={renderProps.onClick}>Login With Facebook</button>
            )}
          />
        }
        <div>
        <h2>Sample Facebook Graph API Queries</h2>
          <button onClick={() => getName()}>Get Page Name</button><br /><br />
          <button onClick={() => getPosts()}>Get Page Posts</button><br /><br />
        </div>
      </div>
    </div>
  );
};

export default Facebook2;