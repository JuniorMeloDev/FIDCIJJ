package bordero.demo.api.dto;

import lombok.Data;

@Data
public class AuthRequestDto {
    private String username; 
    private String email;
    private String password;
}