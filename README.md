## Development

### Install project
```
npm i
```

### Start development
```
npm start
```

### Start development with custom API Host or and Auth Host
```
npm run start -- --define process.env.API_HOST="'https://foo.bar'" --define process.env.AUTH_HOST="'https://foo.bar'"
```

### Update project
```
git pull
npm i
```

### Build dist
```
npm run build
```

### Build with custom API Host
```
npm run build -- --define process.env.API_HOST="'https://foo.bar'"
```

### Build with custom Auth Host
```
npm run build -- --define process.env.AUTH_HOST="'https://foo.bar'"
```
