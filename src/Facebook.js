import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

// App scopes are requested in the FacebookLogin component props

const Facebook = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [longLiveToken, setLongLiveToken] = useState('');
  const [pageInfo, setPageInfo] = useState([]);
  const [pageToken, setPageToken] = useState([]);
  const [clientPageId, setClientPageId] = useState([]);
  // const [clientCode, setClientCode] = useState([]);

  const appSecret = ''; // app secret can be found in the app Dashboard/Setting/Basic
  // const redirectUri = 'http%3A%2F%2Flocalhost%3A3000%2F'; // this may be needed for future requests, 
  //set can be set in the App Dashboard/Products/Facebook Login/Settings/Valid OAuth Redirect URIs
  const appId = ''; // this can be found in the App Dashboard
  const appToken = ''; // this is only really needed for checking the token info so far
  // app token can be found here in when logged into your developer account https://developers.facebook.com/tools/accesstoken/

  // gets info on any tokens
  const getTokenInfo = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/debug_token?input_token=${userData.userToken}&access_token=${appToken}`,
      method: 'get',
    });
    console.log('token info', response);
  };

  // Step 1, login user through facebook button
  // take facebook login response and set resData
  const responseFacebook = (response) => {
    if (response.status !== 'unknown') {
      console.log('response',response);
      setIsLoggedIn(true);
      setUserData({
        userName: response.name,
        userToken: response.accessToken,
        userId: response.id,
      });
    }
  };

   // onclick function that came with FacebookLogin component
  const componentClicked = (response) => {
    console.log('response', response);
  };

  // Step 2, exchange the short term user token for a long live token
  const getLongLiveToken = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userData.userToken}`,
      method: 'get',
    });
    setLongLiveToken(response.data.access_token);
    console.log('Long Live Token', response.data);
  };

  // Step 3, take the user id and longliveToken and request a page token
  const getPageAccessToken = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/${userData.userId}/accounts?access_token=${longLiveToken}`,
      method: 'get',
    });
    console.log('getPageAccessToken Res', response);
    setPageInfo(response.data);
    setClientPageId(response.data.data[0].id);
    setPageToken(response.data.data[0].access_token);  
  };
 

  // Step 4, Store the clientBmSuToken in a secure database and use it 
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

  // graph api query to get the page name
  const getName = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/${clientPageId}?fields=name&access_token=${pageToken}`,
      method: 'get',
    });
    console.log('page name query', response);
  };

  // graph api query to get the pages posts
  const getPosts = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/${clientPageId}/posts?access_token=${pageToken}`,
      method: 'get',
    });
    console.log('posts query', response);
  };

  console.log('user data', userData);
  console.log('long live token', longLiveToken);
  console.log('Page Info', pageInfo);
  console.log('Page Id', clientPageId);
  console.log('Page token', pageToken);

  return(
    <div>
      <h2>Facebook Login</h2>
      <div>
        {isLoggedIn ? 
          <div>
            {userData.name}
            <br />
            <button onClick={() => getTokenInfo()}>Get Token info</button><br /><br />
            <h2>Page Access Flow</h2>
            <button onClick={() => getLongLiveToken()}>1. Get Long Lived User Token</button><br /><br />
            <button onClick={() => getPageAccessToken()}>2. Get Page Token</button><br /><br />
            {/* <h2>Server Side Flow</h2> */}
            {/* <button onClick={() => getClientCode()}>Get Client Code</button><br /><br /> */}
          </div>
          :
          <FacebookLogin 
            appId={appId}
            autoLoad={false}
            fields="name,email,picture"
            // scope="read_insights,pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_ads,public_profile"
            scope="read_insights,pages_show_list,pages_read_engagement,pages_read_user_content,public_profile" // tried on second test user
            onClick={componentClicked}
            callback={responseFacebook}
          />
        }
        <div>
        <h2>Sample Graph API Queries</h2>
          <button onClick={() => getName()}>Get Page Name</button><br /><br />
          <button onClick={() => getPosts()}>Get Page Posts</button><br /><br />
        </div>
      </div>
    </div>
  );
};

export default Facebook;