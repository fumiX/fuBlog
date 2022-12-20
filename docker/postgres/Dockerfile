## TODO configurable locale
FROM postgres:15.1
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LC_ALL de_DE.utf8
