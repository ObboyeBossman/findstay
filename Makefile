.PHONY: api web

api:
	docker start findstay-db
	cd api && SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/findstay SPRING_DATASOURCE_USERNAME=postgres SPRING_DATASOURCE_PASSWORD=postgres mvn spring-boot:run

web:
	npm run dev
