package bordero.demo.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmailRequestDto {
    private List<String> destinatarios;
}
