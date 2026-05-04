package com.educonnect.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BulkGroupInvites {

    private String groupName;

    private List<String> usernames;

}
