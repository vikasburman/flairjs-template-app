# appgears
Unified application framework for JavaScript

Global environmnet setup for development:
1) Brew install: https://brew.sh/
2) Yarn install: brew install yarn
3) Node JS w NPM (will get installed via #2)
4) gulp-cli: npm install --global gulp-cli
5) MySQL install: 
   a) brew install mysql
   b) mysql.server start
   c) mysql_secure_installation
   d) VALIDATE PASSWORD PLUGIN -> y
   e) Policy (medium) -> 1 
   f) root password -> (password)
   g) Remove anonymous user -> y
   i) Disallow remote login remotely -> y
   j) Remove test database -> y
   k) Reload privilege tables -> y

Package.json dependencies install:
1) yarn install

To update:
1) brew upgrade yarn (will update HomeBrew, Yarn and Node all at once)

