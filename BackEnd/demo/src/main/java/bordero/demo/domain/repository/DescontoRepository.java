package bordero.demo.domain.repository;

import bordero.demo.domain.entity.Desconto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DescontoRepository extends JpaRepository<Desconto, Long> {
}
