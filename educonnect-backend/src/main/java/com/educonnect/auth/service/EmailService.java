package com.educonnect.auth.service;


import com.educonnect.auth.dto.request.SendOtpRequest;
import com.educonnect.exceptionhandling.exception.BusinessRuleViolationException;
import com.educonnect.exceptionhandling.exception.EmailSenderException;
import com.educonnect.utils.EmailValidationUtil;
import com.educonnect.utils.PasswordValidationUtil;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class EmailService {

    JavaMailSender javaMailSender;

    @Autowired
    public EmailService(JavaMailSender javaMailSender){
        this.javaMailSender = javaMailSender;
    }

    public void sendOtp(SendOtpRequest request){
        if (!EmailValidationUtil.isValid(request.getTo()) || request.getOtp() == null){
            throw new BusinessRuleViolationException("Give valid email credentials");
        }

        try{
//            SimpleMailMessage mail = new SimpleMailMessage();
//            mail.setTo(to);
//            mail.setSubject("Verify Your Email");
//            mail.setText("Your OTP is " + otp);
//            javaMailSender.send(mail);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true); // true = multipart

            helper.setTo(request.getTo());
            helper.setSubject("Verify Your Email");

            // HTML body
            String htmlContent = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "</head>" +
                    "<body style='margin: 0; padding: 0; background-color: #f5f7fa; font-family: Arial, sans-serif;'>" +
                    "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color: #f5f7fa; padding: 20px;'>" +
                    "<tr>" +
                    "<td align='center'>" +
                    "<table width='600' cellpadding='0' cellspacing='0' border='0' style='background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);'>" +
                    "<tr>" +
                    "<td style='background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 30px 20px; text-align: center; color: white;'>" +
                    "<div style='font-size: 28px; font-weight: 700; margin-bottom: 10px;'>EduConnect</div>" +
                    "<div style='font-size: 16px; opacity: 0.9;'>Secure Authentication System</div>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td style='padding: 40px 30px;'>" +
                    "<h2 style='font-size: 22px; color: #333; margin-bottom: 15px;'>Hello, User!</h2>" +
                    "<p style='color: #555; line-height: 1.6; margin-bottom: 30px;'>You're just one step away from accessing your account. Please use the One-Time Password (OTP) below to complete your verification process.</p>" +
                    "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='background: #f8f9fa; border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0; border: 1px dashed #dee2e6;'>" +
                    "<tr>" +
                    "<td>" +
                    "<div style='font-size: 16px; color: #666; margin-bottom: 15px;'>Your verification code:</div>" +
                    "<div style='font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #2c3e50; background: white; padding: 15px; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);'>" + request.getOtp() + "</div>" +
                    "<div style='font-size: 16px; color: #666;'>This code will expire in 10 minutes</div>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='background: #e8f4fd; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #2196F3;'>" +
                    "<tr>" +
                    "<td>" +
                    "<h3 style='color: #1976D2; margin-bottom: 10px;'>For your security:</h3>" +
                    "<ul style='padding-left: 20px; color: #555;'>" +
                    "<li style='margin-bottom: 8px; line-height: 1.5;'>Never share this OTP with anyone</li>" +
                    "<li style='margin-bottom: 8px; line-height: 1.5;'>Our team will never ask for your OTP</li>" +
                    "<li style='margin-bottom: 8px; line-height: 1.5;'>If you didn't request this code, please ignore this email</li>" +
                    "</ul>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "<p style='color: #555; line-height: 1.6; margin-bottom: 30px;'>Enter this OTP in the verification field to complete your authentication process.</p>" +
                    "<div style='font-size: 12px; color: #999; margin-top: 20px; text-align: center;'>This is an automated message. Please do not reply to this email.</div>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true); // true = send as HTML

            javaMailSender.send(message);

        }
        catch (Exception e){
            throw new EmailSenderException(e.getCause().toString());
        }
    }

    public void sendGroupJoinRequest(String from, String groupName, String email){
        if (!EmailValidationUtil.isValid(email) || from == null || groupName == null){
            throw new BusinessRuleViolationException("Give valid email attributes.");
        }
        try{
            System.out.println(email);
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(email);
            mail.setSubject("Inviting for joining Group");
            mail.setText("I " + from + " invite you to join my group " + groupName + ".");
            javaMailSender.send(mail);
        }
        catch(Exception e){
            throw new EmailSenderException("exception while sending join request." + e.getMessage() + e.getLocalizedMessage());
        }
    }

}
