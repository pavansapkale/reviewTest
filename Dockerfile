FROM nginx:1.23.3-alpine-slim as server
EXPOSE 80
COPY dist /usr/share/nginx/html
COPY health /usr/share/nginx/html/health
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]
