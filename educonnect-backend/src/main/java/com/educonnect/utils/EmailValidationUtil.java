package com.educonnect.utils;

import java.util.regex.Pattern;

public class EmailValidationUtil {

    private static final Pattern pattern = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    public static boolean isValid(String email){
        return pattern.matcher(email).matches();
    }

}
