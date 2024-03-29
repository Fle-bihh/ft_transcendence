build:
	docker-compose -f docker-compose.yml build $(c)
up:
	docker-compose -f docker-compose.yml up -d --build --remove-orphans$(c)
start:
	docker-compose -f docker-compose.yml start $(c)
down:
	docker-compose -f docker-compose.yml down $(c)
destroy:
	docker-compose -f docker-compose.yml down -v $(c)
stop:
	docker-compose -f docker-compose.yml stop $(c)
restart:
	docker-compose -f docker-compose.yml stop $(c)
	docker-compose -f docker-compose.yml up --build -d --remove-orphans$(c)
logs:
	docker-compose -f docker-compose.yml logs --tail=100 -f 
ps:
	docker-compose -f docker-compose.yml ps
prune:
	docker-compose -f docker-compose.yml prune
