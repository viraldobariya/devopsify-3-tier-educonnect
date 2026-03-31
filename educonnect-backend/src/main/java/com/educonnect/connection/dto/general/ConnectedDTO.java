package com.educonnect.connection.dto.general;


import com.educonnect.connection.entity.Connection;
import com.educonnect.user.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ConnectedDTO {

    private Users sender;

    private Users receiver;

    private Connection.RequestStatus status;

}
