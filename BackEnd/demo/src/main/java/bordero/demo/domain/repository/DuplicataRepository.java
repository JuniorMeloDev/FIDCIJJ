package bordero.demo.domain.repository;

import bordero.demo.domain.entity.Duplicata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DuplicataRepository extends JpaRepository<Duplicata, Long>, JpaSpecificationExecutor<Duplicata> {
}
