function extractCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }

function flow(event){
    const bearer = sessionStorage.getItem("bearer")
    if(bearer == null || bearer == "undefined"){
        const authorizationCode = extractCodeFromUrl();
        if (authorizationCode) {
            authenticate_code(authorizationCode, event)
        }else{
            startOAuthFlow(event["clientId"], event["redirect_uri"])
        }
    }else{
        getProfile(decodeURIComponent(escape(atob(bearer))), event)
    }
}

// Function to initiate OAuth flow
function startOAuthFlow(clientId, redirect_uri) {
    const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/auth';
    const scope = 'https://mail.google.com/'; // Scopes required by your application
    const responseType = 'code';
    // Construct the authorization URL
    const authUrl = `${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${redirect_uri}&response_type=${responseType}&scope=${scope}`;
    // Redirect user to the authorization URL
    window.location.href = authUrl;
}

function authenticate_code(authCode, event){
    let headers = new Headers();
    headers.append('Origin','https://techmarkapp.netlify.app/');
    fetch('https://mr6s4xnd46.execute-api.us-east-1.amazonaws.com/codeoauth/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "client_id": event["clientId"],
            "client_secret": event["clientSecret"],
            "redirect_uri": event["redirect_uri"],
            "code": authCode
        })
        }).then((data)=>{
            return data.text();
        }).then((data2)=>{
            const token_json = JSON.parse(data2)
            getProfile(JSON.parse(token_json["body"])["access_token"], event)
    });
}

function getProfile(token, event){
    fetch('https://gmail.googleapis.com/gmail/v1/users/'+ event["email"] +'/profile', {
        method: 'GET', // Change the method accordingly (POST, PUT, etc.)
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        }).then(response => {
          if (!response.ok) {
            alert("Sign In Using "+ event["email"])
          }
          return response.json();
        }).then(data => {
            if(data["emailAddress"] == sessionStorage.getItem("emailid")){
                sessionStorage.setItem("bearer", btoa(unescape(encodeURIComponent(token))))
            }else{
                sessionStorage.setItem("bearer", "undefined")
                startOAuthFlow(event["clientId"], event["redirect_uri"])
            }
        }).catch(error => {
            alert("Network Problem")
    });
}

// Function to decode base64 without using atob
function decodeBase64(encodedString) {
    const base64abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let decoded = '';
  
    for (let i = 0; i < encodedString.length;) {
      const c1 = base64abc.indexOf(encodedString.charAt(i++));
      const c2 = base64abc.indexOf(encodedString.charAt(i++));
      const c3 = base64abc.indexOf(encodedString.charAt(i++));
      const c4 = base64abc.indexOf(encodedString.charAt(i++));
  
      const chr1 = (c1 << 2) | (c2 >> 4);
      const chr2 = ((c2 & 15) << 4) | (c3 >> 2);
      const chr3 = ((c3 & 3) << 6) | c4;
  
      decoded += String.fromCharCode(chr1);
  
      if (c3 !== 64) {
        decoded += String.fromCharCode(chr2);
      }
      if (c4 !== 64) {
        decoded += String.fromCharCode(chr3);
      }
    }
    return decoded;
  }