package com.educonnect.utils;

public class PasswordValidationUtil {

    public static boolean checkPassword(String password){
        if (password == null || password.length() < 8 || password.length() > 16){
            return false;
        }
        boolean isAlpha = false;
        boolean isNum = false;
        boolean isSpecial = false;

        for(char c : password.toCharArray()){
            if (c >= 48 && c <= 57) isNum = true;
            else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) isAlpha = true;
            else isSpecial = true;
        }
        return isAlpha && isNum && isSpecial;
    }

}
