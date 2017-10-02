# appgears
Unified application framework for JavaScript

Global environmnet setup for development:
1) Brew install: https://brew.sh/
2) Yarn install: brew install yarn
3) Node JS w NPM (will get installed via #2)
4) gulp-cli: npm install --global gulp-cli
5) mongodb install: brew install mongodb
6) Robo 3t mongodb gui: https://robomongo.org/download
7) rabbitmq install: brew install rabbitmq
7.1) in <userfolder>/.bash_profile file add:
     PATH=$PATH:/usr/local/sbin
7.2) in ./rabbitmq-env.conf file, update path of CONFIG_FILE and BASE at least
7.3) in /usr/local/etc/rabbitmq/ rename rabbitmq-env.conf file to rabbitmq-env-original.conf and
     copy ./rabbitmq-env.conf file to /usr/local/etc/rabbitmq/
7.4) 7.3 is needed, because somehow setting RABBITMQ_CONF_ENV_FILE=/Users/vikasburman/Data/Projects/GitHub/appgears/source/rabbitmq-env.conf in package.json is not working. If that starts working, 7.3 will not be required. and even editing of CONFIG_FILE will not be required as $PWD/rabbitmq will be used to get path of local folder (TODO: get a fix for this)
8) redis install: brew install redis

Package.json dependencies install:
1) yarn install

To update:
1) brew upgrade yarn (will update HomeBrew, Yarn and Node all at once)

