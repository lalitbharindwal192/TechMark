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
            //alert("Sign In Using "+ event["email"])
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

function aws_config(){
    AWS.config.update(
        {
            region: "us-east-1",/*endpoint: "http://localhost:8000",*/
            accessKeyId: ("APGAJBXVL3W76N4WAIKA").split('').reverse().join(''),
            secretAccessKey: ("OLQp/1824pRicifOpOmQS5gb0Vzz/l9WhnnL43YK").split('').reverse().join('')
        });
}

function uploadContent(Log, id){
    // Create a new Date object
    var currentDate = new Date();
    // Get individual components of the date and time
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Zero-padding the month
    var day = currentDate.getDate().toString().padStart(2, '0'); // Zero-padding the day
    var hours = currentDate.getHours().toString().padStart(2, '0'); // Zero-padding the hours
    var minutes = currentDate.getMinutes().toString().padStart(2, '0'); // Zero-padding the minutes
    var seconds = currentDate.getSeconds().toString().padStart(2, '0'); // Zero-padding the seconds
    document.getElementById('send-emails-btn').innerHTML = `<button class="btn btn-sm btn-outline-primary" onclick="AlertBtn()" style="margin:auto;padding:12px 6px 15px; max-width:100%; width:100%; position: relative; margin-top: -0.8cm; background-color: tomato; border-color: tomato;">Sending...</button>`;
    aws_config()
    var s3 = new AWS.S3();
    var params = {
        Body: JSON.stringify(Log),
        Bucket: "techmark-mail",
        Key: `${Log["from"]}/${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`,
        ServerSideEncryption: "AES256", 
        StorageClass: "STANDARD_IA"
    };

    s3.putObject(params, function(err, data) {
         if(err){
            //console.log(err, err.stack); // an error occurred
            alert("Network Problem! Try After Sometime")
         }else{
            Log["to"].forEach(async (email) => {
                await sendMail(email.trim(), Log["message"], id);
            });
         }   
    });
}

//Sending Script
var tempCount = 0;
function processEmails(obj) {
    // Get the value from the textarea
    var text = document.getElementById('email-list').value;
    var emailRegex = /\b[A-Za-z0-9._]+@(?:[A-Za-z0-9-]+\.)+(?:com|org|in|in.net|net.in|net|co|co.in|uk|group|digital|io|ai|live|studio|au|ventures|is)\b/g;
    // Find all matches of valid email patterns in the textarea
    var validEmails = text.match(emailRegex);
    if(obj.id == "editor1"){
        var htmlContent = editor1.getHTMLCode();
    }else{
        var iframe = document.getElementById("tempEditor");
        if(iframe.contentWindow){
            var iframevariable = iframe.contentWindow.display();
            var htmlContent = iframevariable;
        }
    }

    if(validEmails){
        const uploadLog = {
            "from": sessionStorage.getItem("emailid"),
            "to": validEmails,
            "subject": document.getElementById("subject").value,
            "message": htmlContent
        }
        uploadContent(uploadLog, obj.id)
    }
}
var temp = 0;
function countLines() {
    var text = document.getElementById('email-list').value;
    var lineCount = (text.match(/\n/g) || []).length + 1;
    document.getElementById('lineCount').innerText = 'Number of Lines: ' + lineCount;
    var emailRegex = /\b[A-Za-z0-9._]+@(?:[A-Za-z0-9-]+\.)+(?:com|org|in|in.net|net.in|net|co|co.in|uk|group|digital|io|ai|live|studio|au|ventures|is)\b/g;
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
async function sendMail(mailId, htmlContent, id){
    return new Promise((resolve) => {
        setTimeout(() => {
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
<title>TechMark</title>
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
                document.getElementById('send-emails-btn').innerHTML = '<button class="btn btn-sm btn-outline-primary" id="'+ id +'" onclick="processEmails(this)" style="margin:auto;padding:12px 6px 15px;max-width: 100%; width:100%; position: relative; margin-top: -0.8cm; background-color: #45d56d; border-color: #45d56d;">Send Email</button>';
                Success++;
                EmailCount++;
            }else{
                document.getElementById("mailLog").innerHTML += '<tr><td>'+ EmailCount +'</td><td>'+ mailId +'</td><td style="color: red;"><i class="fas fa-times"></i>Failed</td></tr>';
                document.getElementById("failedEmails").innerHTML = "Failed:" + failed;
                document.getElementById('send-emails-btn').innerHTML = '<button class="btn btn-sm btn-outline-primary" id="'+ id +'" onclick="processEmails(this)" style="margin:auto;padding:12px 6px 15px;max-width: 100%; width:100%; position: relative; margin-top: -0.8cm; background-color: #45d56d; border-color: #45d56d;">Send Email</button>';
                failed++;
                EmailCount++;
            }
        }).catch(error => {
        document.getElementById("mailLog").innerHTML += '<tr><td>'+ mailId +'</td><td style="color: red;"><i class="fas fa-times"></i>Error</td></tr>';
        console.log(EmailCount + ":- " + error.message);
    });
    resolve();
}, 1000);
});
}

function textEditor(){
    document.getElementById("Editor").innerHTML = `<div class="row">
    <div class="col-md-12" style="text-align: center;">
        <h6 style="color: white; font-weight: bold; font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;">Message</h6>
        <hr>
    </div>
    </div>

    <div class="row">
        <div class="col-xl-12">
            <div style="margin:auto;padding:12px 6px 36px;max-width: 100%;">
                <div class="hs-docs-content-divider">
                <link rel="stylesheet" href="mail/editor/richtexteditor/rte_theme_default.css" />
                <div id="div_editor1"></div>
                <div id="send-emails-btn">
                    <button class="btn btn-sm btn-outline-primary" id="editor1" onclick="processEmails(this)" style="margin:auto;padding:12px 6px 15px;max-width: 100%;width:100%; position: relative; margin-top: -0.8cm; background-color: #45d56d; border-color: #45d56d;">Send Email</button>
                </div>
                <h6 onclick="advanceEditor()" style="color: white; text-align: center;">Advance Editor</h6>
                </div>
            </div>
        </div>
    </div>`;

    var editor1 = new RichTextEditor("#div_editor1", { skin: "green", toolbar: "default" });
    if(sessionStorage.getItem("templateId") != null && sessionStorage.getItem("templateId") != "null"){
        editor1.setHTMLCode(sessionStorage.getItem("templateId"));
        sessionStorage.setItem("templateId", null);
    }
}

function advanceEditor(){
    document.getElementById("Editor").innerHTML = `<div class="row">
    <div class="col-md-12" style="text-align: center;">
        <h6 style="color: white; font-weight: bold; font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;">Advance Editor</h6>
        <hr>
    </div>
    </div>
    <div class="row">
        <div class="col-xl-12">
            <iframe id="tempEditor" src="mail/email editor/templateEditor.html" width="100%" height="600"></iframe>
        </div>
    </div>
    <div class="row">
        <div class="col-xl-12" style="border-style: none; width: 100%; text-align: center;">
            <div id="send-emails-btn">
                <button class="btn btn-sm btn-outline-primary" id="editor2" type="button" onclick="processEmails(this)" style="width: 100%; margin-top: -10px; background-color: #45d56d; border-color: #45d56d;">Send Email</button>
            </div>
            <h6 onclick="textEditor()" style="color: white; text-align: center;">Text Editor</h6>
        </div>
    </div>
    <hr>`;
}