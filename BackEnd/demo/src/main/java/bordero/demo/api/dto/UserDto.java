package bordero.demo.api.dto;

import bordero.demo.domain.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String telefone;
    private String roles;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .telefone(user.getTelefone())
                .roles(user.getRoles())
                .build();
    }
}