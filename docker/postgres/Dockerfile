## TODO configurable locale
FROM postgres:15.1
LABEL org.opencontainers.image.description="PostgreSQL image for use with the fu-blog, customized with German locale (for postgres search)"
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LC_ALL de_DE.utf8
EXPOSE 5432
