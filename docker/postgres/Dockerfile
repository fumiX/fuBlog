FROM postgres:15.1
ARG language
RUN localedef -i $language -c -f UTF-8 -A /usr/share/locale/locale.alias $language.UTF-8
ENV LC_ALL $language.utf8
EXPOSE 5432
