# Stage 1
FROM golang:alpine as builder
RUN apk update && apk add --no-cache git
RUN mkdir /codenames 
COPY . /codenames
WORKDIR /codenames
RUN go get -d -v
RUN go build -o codenames .
# Stage 2
FROM alpine
RUN adduser -S -D -H -h /app appuser
USER appuser
COPY --from=builder /codenames/ /app/
WORKDIR /app
CMD ["./codenames"]