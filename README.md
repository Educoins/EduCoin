Under Construction.

# How to build

## ubuntu 16.04

### compilation

    sudo apt install libboost-all-dev libssl-dev build-essential libdb5.3++-dev libqrencode-dev libminiupnpc-dev qt5-qmake libqt5webkit5-dev git
    git clone https://github.com/Educoins/Educoin-V-1.0.git
    cd Educoin-V-1.0
    /usr/lib/i386-linux-gnu/qt5/bin/qmake -o Makefile EduCoin.pro
    make

### packaging (ugly, I know #fixme)

    git clone https://github.com/Educoins/debian-packaging-ugly.git
    cp Educoin-V-1.0.git/EduCoin debian-packaging-ugly/educoin-qt_2017.0.0-ubuntu1/usr/bin
    cd debian-packaging-ugly\
    dpkg-deb --build educoin-qt_2017.0.0-ubuntu1/

## Mac OS X

* Qt Mac OS X SDK: http://qt-project.org/downloads

* MacPorts: http://www.macports.org/install.php

  - Download and install the *Qt Mac OS X SDK*. It is recommended to also install Apple's Xcode with UNIX tools. (Version: >=5.5)

  - Download and install *MacPorts*.

  - Execute the following commands in a terminal to get the dependencies:
```
    sudo port selfupdate
    sudo port install boost db48 miniupnpc
```
  - Change target verison to 10.9 in qmake.conf for avoid compiler issue
```
PATH: (QT installation folder)/clang_64/mkspecs/macx-clang/qmake.conf
QMAKE_MACOSX_DEPLOYMENT_TARGET = 10.9
```
  - Open the .pro file in Qt Creator and build as normal (cmd-B)

  - Use macdeploy for build deploy mac app version

Execute the following commands in a terminal:
```
cd (release build dir)
(QT installation folder)/clang_64/bin/macdeployqt ./Educoin.app
```

