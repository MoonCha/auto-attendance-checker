# 웹사이트 자동 출석기

## 소개

하루마다 특정 웹사이트에 로그인해서 자동으로 출석체크를 해주는 스크립트입니다. 설정 파일에 계정 정보를 입력해놓으면, 일정 주기로 해당 정보를 이용해 로그인한 후 출석체크를 진행합니다.

## 지원되는 사이트 및 기능

### **인벤(inven.co.kr)**

- 하루 로그인 보상 이니
- 아이마트 출석 체크
- 주간 게임순위 투표

### **코인판(coinpan.com)**

- 출석 체크

## 사용 방법

### **방법 1. Docker 이용**

1. **Docker 설치**
    > Windows를 사용하는 경우

    https://docs.docker.com/toolbox/toolbox_install_windows/ 에서 설치 설명서를 잘 읽으면서 Docker toolbox를 설치합니다.

    간단히 요약하면 설치 파일을 실행하여 설치를 끝마친 후, `Docker Quickstart Terminal`을 실행하여 정상적으로 `$`로 시작하는 명령창이 시작되게하면 됩니다.

    Docker toolbox를 이용하는 경우, 앞으로의 모든 docker 명령어는 반드시 `Docker Quickstart Terminal`를 통해 실행시키시기 바랍니다.

    **왜 toolbox 인가?** - Windows Docker는 Hyper-V를 기반으로 작동합니다. 하지만 Hyper-V 기능이 켜져 있으면 대부분의 Android Emulator가 작동하지 않기 때문에 선호하지 않습니다. 이 부분이 상관 없다면, Toolbox가 아닌 일반 Docker for Windows를 설치해도 무방합니다.

    > Linux를 이용하는 경우

    Linux 이용자의 경우 Docker 설치법을 알 것이라 생각하므로, Ubuntu를 만 설명합니다.

    ```bash
    sudo apt-get update
    sudo apt-get install docker
    ```

    위 두 명령을 입력하여 Docker를 설치합니다.

2. **Docker 이미지 빌드**

    Docker를 이용하여 실행하기 전에, docker-compose.yaml에서 이용할 이미지를 빌드해야 합니다. 빌드하기 위해서, `docker build -t auto-attendance-checker .` 명령을 입력합니다.

3. **계정 정보 설정**

    docker-compose.yaml를 수정해서 자신의 계정 정보를 입력해야 합니다. docker-compose.yaml을 연 후, environment 부분을 아래와 같이 수정해야 합니다.

    ```yaml
    # 예시 설정
    environment:
        - COMMA_SPLITED_TARGET_SITE_LIST=COINPAN,INVEN
        - COINPAN_ID=coinpan_tester
        - COINPAN_PASSWORD=123456
        - INVEN_ID=inven_tester
        - INVEN_PASSWORD=123456
        - LOGIN_TRIAL_CYCLE_MSEC=14400000
    ```

    이용하려는 사이트에 맞는 ID, PW를 채워넣고 대상으로 하는 웹사이트 목록을 수정합니다.

    > ex) INVEN만 이용하는 경우
    ```yaml
    environment:
        - COMMA_SPLITED_TARGET_SITE_LIST=INVEN
        - COINPAN_ID=
        - COINPAN_PASSWORD=
        - INVEN_ID=inven_tester
        - INVEN_PASSWORD=123456
        - LOGIN_TRIAL_CYCLE_MSEC=14400000
    ```

    `LOGIN_TRIAL_CYCLE_MSEC` 설정은 자동 로그인을 시도하는 주기입니다. 기본 설정은 4시간 마다 시도하게 되어 있으므로, 그대로 놔두어도 무방합니다.

4. **실행**

    `docker-compose up` 명령을 실행합니다. 그러면 곧 자동 출석이 시작되는 것을 확인할 수 있습니다.

### **방법 2. 수동으로 환경 세팅 후 실행**

1. 계정 정보 설정

    config.ts를 수정해서 자신의 계정 정보를 입력해야 합니다. config.ts를 연 후 CONFIG 부분을 수정합니다.

    ```typescript
    // 예시 설정
    const CONFIG = {
        COMMA_SPLITED_TARGET_SITE_LIST: "COINPAN,INVEN",
        COINPAN_ID: 'coinpan_tester',
        COINPAN_PASSWORD: '123456',
        INVEN_ID: 'inven_tester',
        INVEN_PASSWORD: '123456',
        LOGIN_TRIAL_CYCLE_MSEC: 4 * 3600 * 1000,

        ...
    };
    ```

    이용하려는 사이트에 맞는 ID, PW를 채워넣고 대상으로 하는 웹사이트 목록을 수정합니다.

    > ex) INVEN만 이용하는 경우

    ```typescript
    const CONFIG = {
        COMMA_SPLITED_TARGET_SITE_LIST: "INVEN",
        COINPAN_ID: '',
        COINPAN_PASSWORD: '',
        INVEN_ID: 'inven_tester',
        INVEN_PASSWORD: '123456',
        LOGIN_TRIAL_CYCLE_MSEC: 4 * 3600 * 1000,

        ...
    };
    ```

    `BROWSER_EXECUTABLE_PATH` 등 위 예시에서 표시한 이외의 항목은 임의로 변경하면 정상적으로 동작하지 않습니다.

> 미완성 파트: 여러 dependency(ts-node, typescript, puppeteer 등)설치 후 `ts-node index.ts` 실행

## 주의사항

- AWS에서 실행하는 경우 Coinpan 자동 출석이 동작하지 않습니다. Coinpan에서 AWS의 아이피를 차단했습니다.
- 사이트 페이지가 변경되는 경우 제대로 동작하지 않을 수 있습니다.
- Headless browser를 써서 자동화 한 특성상 실행 환경, 유저/계정에 저장된 사이트 설정 등에 의해 동작이 달라질 수 있습니다.
- 간헐적으로 발생하는 예상치 못한 상황으로 인해 자동 출석체크가 실패할 수 있습니다. (재시도 하면 성공하는 경우도 있다는 뜻)

## TODO

- Docker browser에서 sandbox 모드 켤 수 있게 만드는 방법 찾기
