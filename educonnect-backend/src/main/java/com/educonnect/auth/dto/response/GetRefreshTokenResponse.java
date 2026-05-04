package com.educonnect.auth.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GetRefreshTokenResponse {

    private String refreshToken;

}
