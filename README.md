ClientVerificationWeb
=====================
이 웸 API 시스템은 트위치 스트리머들의 마인크래프트 시청자 참여 콘텐츠 진행을 보다 편리하게 진행할 수 있도록 해주는 목적으로 개발되었습니다.
---------------------------------------------------------------------------------------------------------------------------------
###### 저작권: (c) 2023 Rorum (phoo8651@rorum.net) all rights reserved.

# 런타임 환경
- Node.js 18.16.1 LTS

### 윈도우
런타임 환경이 설치되어 있지 않다면 [Node.js 공식 홈페이지](https://nodejs.org/ko/)에서 설치할 수 있습니다.
런타임 환경이 구성되었다면 `npm install` 명령어를 통해 의존성을 설치할 수 있습니다.

### 우분투 리눅스
`sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash` 명령어를 입력합니다.
`sudo source ~/.bashrc` 명령어를 입력해 활성화 합니다.
`nvm install v18.16.1` 명령어를 입력해 런타임 환경을 설치합니다.
`nvm use 18.16.1` 명령어를 통해 node.js를 활성화 합니다.
런타임 환경이 구성되었다면 `npm install` 명령어를 통해 의존성을 설치할 수 있습니다.

# 설정
.env 파일을 생성 후 env_example의 내용을 복사하여 붙여넣습니다.
.env 파일의 빈 공간에 내용을 채워 넣습니다. 각 빈공간은 무슨 역할을 하며, 어떻게 넣어야하는 지 서술되어 있습니다.

# 테스트 디플로이
`npm run start` 명령어를 통해 실행할 수 있습니다.
`npm run dev` 명령어를 통해 개발 모드로 실행할 수 있습니다.

# 서비스 디플로이 (윈도우, 리눅스 공통)
`npm install -g pm2` 명령어를 통해 pm2를 설치합니다.
`pm2 start bin/www --watch` 명령어를 통해 라이브 디플로이를 할 수 있습니다.
`pm2 monit` 명령어를 통해 디플로이 상태를 확인할 수 있습니다.
`pm2 logs` 명령어를 통해 디플로이 로그를 확인할 수 있습니다.

# 경고
윈도우에서 호스팅 하는 경우 C드라이브에 프로젝트를 위치시켜야 합니다. 또한 프로젝트 폴더경로에 한글이나 공백이 있으면 안됩니다. (ex: C:\ClientVerificationWeb)
이 프로젝트를 디플로이하는 경우 Nginx 또는 Apache에서 HTTPS를 통해 프로젝트를 프록시 호스팅해야 합니다.
이 프로젝트는 HTTPS를 통해 호스팅되지 않는 경우, 보안상의 문제가 발생할 수 있습니다.

# Nginx (권장) 설치방법
### 윈도우의 경우
Node.js가 pm2에 의해 먼저 호스팅 되어야 합니다.
Nginx 최신 버전을 설치하기위해 Nginx 공식 사이스에서 프로그램(ZIP)을 받아 C드라이브에 압축을 해제합니다. (ex: C:\nginx)
Nginx를 실행합니다.
nginx.conf 파일을 엽니다. (ex: C:\nginx\conf\nginx.conf)
server_name을 본인의 도메인으로 수정합니다.

[윈도우에서 Lets Encrypt 인증서 발급하기](https://blog.itcode.dev/posts/2021/08/19/lets-encrypt) 를 참고해 인증서를 생성해주세요 (인증서의 저장위치는 c:\ca 로 해주세요)
nginx.conf 파일을 엽니다. (ex: C:\nginx\conf\nginx.conf)
프로젝트 파일중 nginx-example.conf를 열어 내용 전체를 복사해 붙여 넣습니다.
server_name을 본인의 도메인으로 수정합니다
ssl_certificate C:\ca\example.com-chain.pem; ssl_certificate_key C:\ca\example.com-key.pem; 의 경로를 수정해줍니다.

[윈도우에서 OPENSSL 설치하기](https://extrememanual.net/2039), [윈도우에서 dhparam 생성하기](https://extrememanual.net/2047)를 참고해 dhparam.pem 파일을 생성해주세요 (인증서의 저장위치는 c:\ca 로 해주세요)
ssl_dhparam C:\ca\dhparam.pem; 의 경로를 수정해줍니다.

nginx를 실행하면 이제 윈도우에서 사용이 가능해집니다.

### 우분투 리눅스의 경우
`sudo apt update` 명령어를 통해 우분투를 업데이트 해줍니다.
`sudo apt install nginx` 명령어를 통해 Nginx를 설치합니다.
`sudo systemctl start nginx` 명령어를 통해 Nginx를 실행합니다.

`sudo nao /etc/nginx/sites-available/default` 명령어를 통해 Nginx 설정 파일을 엽니다.
server_name을 본인의 도메인으로 수정합니다.
root /var/www/html; 과 index index.html index.htm index.nginx-debian.html; 을 삭제합니다.
location 부분을 다음과 같이 수정합니다.
```
location / {
  proxy_pass http://localhost:3000;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Host $http_host;
}
```
`sudo add-apt-repository ppa:certbot/certbot` 명령어를 통해 certbot 저장소를 추가합니다.
`sudo apt-get install python-certbot-nginx` 명령어를 통해 certbot을 설치합니다.
`sudo certbot --nginx -d example.com` 명령어를 통해 인증서를 발급합니다. example.com 부분을 본인의 도메인으로 수정해주세요.

`Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.` 라는 메세지가 나오면
`2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for new sites, or if you're confident your site works on HTTPS. You can undo this change by editing your web server's configuration.` 내용이 있는지 확인 후 2를 넣고 엔터를 칩니다.
만약 과정에서 문제가 생기면 구글이나 GPT에게 물어보세요
설정이 완료 되었다면 `sudo service nginx restart`를 통해 nginx를 재시작 해주세요.

# 기여
이 프로젝트는 MIT 라이선스를 따릅니다.
이 프로젝트에 기여하고 싶으신 분들은 이 프로젝트를 포크한 후, 포크한 프로젝트에서 작업을 진행하신 후, 이 프로젝트로 풀 리퀘스트를 보내주시면 됩니다.
이 프로젝트에 대한 문의는 phoo8651@rorum.net으로 보내주시면 됩니다.

# 프로젝트 구조
### (관련 지식이 있는 분들만 수정해주세요)
- bin
  - www: 서버 실행 스크립트
- node_modules: 의존성 모듈
- public
  - images: 이미지 파일
  - javascripts: 클라이언트 자바스크립트 파일
  - stylesheets: 클라이언트 스타일시트 파일
  - 그외: favicon, robots.txt 등
- routes
  - account: 계정 관련 라우터
  - oauth: 트위치와 마이크로소프트 계정 연동 라우터
  - index: 메인 라우터
- views: 클라이언트 뷰 파일(html)
- .env: 환경 변수 파일
- app.js: 서버 설정 파일
- mongo.js: MongoDB 연결 파일
- package.json: 프로젝트 정보 파일
