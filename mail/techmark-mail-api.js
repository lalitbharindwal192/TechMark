function extractCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }

function flow(event){
    const bearer = sessionStorage.getItem("bearer")
    if(bearer == null || bearer == "undefined"){
        const authorizationCode = extractCodeFromUrl();
        if (authorizationCode) {
            authenticate_code(authorizationCode, event);
        }else{
            startOAuthFlow(event["clientId"], event["redirect_uri"]);
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
    headers.append('Origin','https://techmarkapp.netlify.app');
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
            if(data["emailAddress"] == event["email"]){
                sessionStorage.setItem("bearer", btoa(unescape(encodeURIComponent(token))))
            }else{
                sessionStorage.setItem("bearer", "undefined")
                startOAuthFlow(event["clientId"], event["redirect_uri"])
            }
        }).catch(error => {
            alert("Network Problem")
    });
}

//Sending Script
var tempCount = 0;
function processEmails() {
    // Get the value from the textarea
    var text = document.getElementById('email-list').value;
    var emailRegex = /\b[A-Za-z0-9._]+@(?:[A-Za-z0-9-]+\.)+(?:com|org|in|in.net|net.in|net|co|co.in|uk|group|digital|io|ai|live|studio|ventures)\b/g;
    // Find all matches of valid email patterns in the textarea
    var validEmails = text.match(emailRegex);
    // Count the number of valid emails
    var validEmailCount = validEmails ? validEmails.length : 0;
    // Split the text by new lines to get individual emails
    // Process the emails (for example, validation or further handling)
    if(validEmails){
        if(validEmailCount != tempCount || validEmailCount == tempCount){
            validEmails.forEach((email, index) => {
                setTimeout(() => {
                    document.getElementById('send-emails-btn').innerHTML = `<button class="btn btn-sm btn-outline-primary" onclick="AlertBtn()" style="margin:auto;padding:12px 6px 15px; max-width:100%; width:100%; position: relative; margin-top: -0.8cm; background-color: tomato; border-color: tomato;">Sending to ${email.trim()}</button>`;
                    sendMail(email.trim());
                    tempCount++;
                }, index * 500);
            });
        }
    }else{
        tempCount = 0;
    }
}
var temp = 0;
function countLines() {
    var text = document.getElementById('email-list').value;
    var lineCount = (text.match(/\n/g) || []).length + 1;
    document.getElementById('lineCount').innerText = 'Number of Lines: ' + lineCount;
    var emailRegex = /\b[A-Za-z0-9._]+@(?:[A-Za-z0-9-]+\.)+(?:com|org|in|in.net|net.in|net|co|co.in|uk|group|digital|io|ai|live|studio|au)\b/g;
    // Find all matches of valid email patterns in the textarea
    var validEmails = text.match(emailRegex);
    // Count the number of valid emails
    var validEmailCount = validEmails ? validEmails.length : 0;
    // Split the text by new lines to get individual emails
    // Process the emails (for example, validation or further handling)
    if(validEmails){
        if(validEmailCount != temp || validEmailCount == temp){
            document.getElementById("valid-emails").innerHTML = "";
            validEmails.forEach(email => {
            // Perform validation or use the emails as needed
            // Here, you can perform actions like validation or sending data to the server
            document.getElementById("valid-emails").innerHTML += "<li>"+ email.trim() +"</li>";
            temp++;
        });
    }
}else{
    document.getElementById("valid-emails").innerHTML = "";
    temp = 0;
}
    document.getElementById('validEmailCount').innerText = 'Number of valid emails: ' + validEmailCount;
}

function AlertBtn(){
    alert("Please wait while sending emails...");
}

var Success = 1;
var failed = 1;
var EmailCount = 1;
function sendMail(mailId){
const htmlContent = editor1.getHTMLCode();
              
const raw = 
`From: ${sessionStorage.getItem("emailid")}
To: ${mailId}      
Subject: ${document.getElementById("subject").value}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="techmark-mail-boundary"

--techmark-mail-boundary
Content-Type: text/plain; charset="UTF-8"

${editor1.getPlainText()}

--techmark-mail-boundary
Content-Type: text/html; charset="UTF-8"

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HTML Content from Plain Text</title>
</head>
<body>
${htmlContent}
</body>
</html>

--techmark-mail-boundary--`;

    const requestBody = {
        // Your request body data (could be an object or any data format required by the API)
        "raw": btoa(unescape(encodeURIComponent(raw)))
    };
    
    //const token = sessionStorage.getItem("bearer");
    fetch('https://gmail.googleapis.com/gmail/v1/users/'+ sessionStorage.getItem("emailid")+ '/messages/send', {
         method: 'POST', // Change the method accordingly (POST, PUT, etc.)
         headers: {
            'Authorization': `Bearer ${decodeURIComponent(escape(atob(sessionStorage.getItem("bearer"))))}`,
            'Content-Type': 'application/json', // Adjust the content type as needed
            // Add other headers if required by the API
        },
         body: JSON.stringify(requestBody) // Convert the request body to JSON string
        }).then(response => {
         if (!response.ok) {
            return false
        }
         return response.json();
        }).then(data => {
            if(data["id"]){
                document.getElementById("mailLog").innerHTML += '<tr><td>'+ EmailCount +'</td><td>'+ mailId +'</td><td style="color: #45d56d;"><i class="fas fa-check"></i> SENT</td></tr>';
                document.getElementById("seccessEmails").innerHTML = "Success:" + Success;
                document.getElementById('send-emails-btn').innerHTML = '<button class="btn btn-sm btn-outline-primary" onclick="processEmails()" style="margin:auto;padding:12px 6px 15px;max-width: 100%; width:100%; position: relative; margin-top: -0.8cm; background-color: #45d56d; border-color: #45d56d;">Send Email</button>';
                Success++;
                EmailCount++;
            }else{
                document.getElementById("mailLog").innerHTML += '<tr><td>'+ EmailCount +'</td><td>'+ mailId +'</td><td style="color: red;"><i class="fas fa-times"></i>Failed</td></tr>';
                document.getElementById("failedEmails").innerHTML = "Failed:" + failed;
                document.getElementById('send-emails-btn').innerHTML = '<button class="btn btn-sm btn-outline-primary" onclick="processEmails()" style="margin:auto;padding:12px 6px 15px;max-width: 100%; width:100%; position: relative; margin-top: -0.8cm; background-color: #45d56d; border-color: #45d56d;">Send Email</button>';
                failed++;
                EmailCount++;
            }
        }).catch(error => {
        document.getElementById("mailLog").innerHTML += '<tr><td>'+ mailId +'</td><td style="color: red;"><i class="fas fa-times"></i>Error</td></tr>';
        console.log(EmailCount + ":- " + error.message);
    });
}