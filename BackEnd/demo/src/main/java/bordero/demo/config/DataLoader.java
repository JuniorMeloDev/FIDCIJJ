package bordero.demo.config;

import bordero.demo.domain.entity.User;
import bordero.demo.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", passwordEncoder.encode("admin"), "ROLE_ADMIN"));
            System.out.println("************************************************************");
            System.out.println("Nenhum usuário encontrado. Usuário padrão 'admin' com senha 'admin' e cargo 'ADMIN' foi criado.");
            System.out.println("************************************************************");
        }
    }
}