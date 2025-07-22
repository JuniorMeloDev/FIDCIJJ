package bordero.demo.service;

import bordero.demo.domain.entity.User;
import bordero.demo.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginIdentifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(loginIdentifier)
                .orElseGet(() -> userRepository.findByEmail(loginIdentifier)
                        .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + loginIdentifier)));

        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(),
                Arrays.stream(user.getRoles().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList()));
    }
}