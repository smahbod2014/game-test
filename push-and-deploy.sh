
cd backend
docker build  -t my-codenames:latest .
docker tag my-codenames:latest registry.heroku.com/nameless-island-33777/web
docker push registry.heroku.com/nameless-island-33777/web
heroku container:release web --app nameless-island-33777