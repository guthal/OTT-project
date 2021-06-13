import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email import encoders
from email.mime.base import MIMEBase
from datetime import datetime
import sys, os

"""
Dear Dev, Please turn on 'Less secure app access' access in sender's gmail account setting.
https://myaccount.google.com/lesssecureapp
"""


mail_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<img src="cid:image1">
<h3>Download your course !</h3>
<blockquote>Dear --customerName--,<br>
    Thank you for purchasing our course, --courseName--.<br>
    Kindly download the course as attached.<br>
    Contact <a href="mailto:avscope@gmail.com">AVScope</a> for assisting your queries.<br><br>
</blockquote>
<p>
    Regards,<br>
    AVSCOPE, Bangalore.<br>
    <a href="mailto:avscope@gmail.com"> avscope@gmail.com</i><br>
    <a href = "www.avscope.in"> www.avscope.in</a>
</p>

<i>This is auto generated email. Please do not reply.</i>


</body>
</html>
"""


mail_contentAlternate = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

<h3>Download your course !</h3>
<blockquote>Dear --customerName--,<br>
    Thank you for purchasing our course, --courseName--.<br>
    Kindly download the course as attached.<br>
    Contact <a href="mailto:avscope@gmail.com">AVScope</a> for assisting your queries.<br><br>
</blockquote>
<p>
    Regards,<br>
    AVSCOPE, Bangalore.<br>
    <a href="mailto:avscope@gmail.com"> avscope@gmail.com</i><br>
    <a href = "www.avscope.in"> www.avscope.in</a>
</p>

<i>This is auto generated email. Please do not reply.</i>


</body>
</html>
"""


#Current Date and Time
currentDateTime = datetime.now().strftime('%d-%b-%Y %H:%m:%S')

#Senders mail addresses and password. Please ensure 'Less secure app access' is accessed
sender_address = 'mallikarjun.j@science.christuniversity.in'
sender_pass = input("Input your pasword for -> "+sender_address) #'YourPassword'

#Recievers Email ID. Let there be multiple recepients
receiver_address =  ['vg931697@gmail.com', 'mallikarjunj28@gmail.com','mallikarjun.j@science.christuniversity.in']   #'mallikarjunj28@gmail.com' | 'vg931697@gmail.com'

#MIME Setup : 
message = MIMEMultipart('related')
message['From'] = sender_address
message['To'] = ", ".join(receiver_address)
message['Subject'] = 'AVSCOPE : Your course is ready to be downloaded | ' + currentDateTime   #The subject line
#The body and the attachments for the mail
message.attach(MIMEText(mail_content, 'html'))



# Encapsulate the plain and HTML versions of the message body in an
# 'alternative' part, so message agents can decide which they want to display.
msgAlternative = MIMEMultipart('alternative')
message.attach(msgAlternative)

msgText = MIMEText(mail_contentAlternate , 'html') #alternate non image embeded into html
msgAlternative.attach(msgText)

# We reference the image in the IMG SRC attribute by the ID we give it below
msgText = MIMEText(mail_content, 'html') # image is embeded into html
msgAlternative.attach(msgText)

# This example assumes the image is in the current directory
fp = open('./avscopelogo.jpg', 'rb')
msgImage = MIMEImage(fp.read())
fp.close()

# Define the image's ID as referenced above
msgImage.add_header('Content-ID', '<image1>')
message.attach(msgImage)


#Attachement if any, The file shuold be in same directory as this script
files = "./CustomerFiles"
filenames = [os.path.join(files, f) for f in os.listdir(files)]
for file in filenames:
    part = MIMEBase('application', 'octet-stream')
    part.set_payload(open(file, 'rb').read())
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', 'attachment; filename="%s"'% os.path.basename(file))
    # Add attachment to message and convert message to string
    message.attach(part)
    
text = message.as_string()


#Create and create SMTP session for sending the mail.
session = smtplib.SMTP('smtp.gmail.com', 587) #use gmail with port
session.starttls() #enable security
session.login(sender_address, sender_pass) #login with mail_id and password
text = message.as_string()
session.sendmail(sender_address, receiver_address, text)
session.close()
print('Mail Sent')