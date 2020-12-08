# https://hub.docker.com/_/node/
# BUG SSL/Tipimail avec debian buster: https://github.com/SocialGouv/domifa/issues/1033
FROM node:14.15.1-stretch 

USER root

# install common tools
ENV CORE_PACKAGES sudo bash wget vim git bash-completion xsel rubygems build-essential ruby-dev

# install via APT
RUN apt-get update && \
    apt-get install -q -y -o Acquire::Retries=10 $CORE_PACKAGES && \
# immediately remove temporary files
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# allow 'node' user to go sudo without password
RUN adduser node sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# sexy bash prompt: https://github.com/twolfson/sexy-bash-prompt
USER node
RUN cd /tmp && git clone --quiet --depth 1 --config core.autocrlf=false https://github.com/twolfson/sexy-bash-prompt && cd sexy-bash-prompt && make --quiet install && rm -rf /tmp/sexy-bash-prompt/

USER root
RUN cp /home/node/.bash_prompt /etc/bash.sexy-bash-prompt && echo '. /etc/bash.sexy-bash-prompt' | tee --append /etc/bash.bashrc

# ls colors: https://github.com/trapd00r/LS_COLORS
USER root
RUN wget --quiet https://raw.github.com/trapd00r/LS_COLORS/master/LS_COLORS -O /etc/bash.dircolors && echo 'eval $(dircolors -b /etc/bash.dircolors)' | tee --append /etc/bash.bashrc

# npm completion
RUN npm completion >> /etc/bash.bashrc

# set default docker user
USER node

# force color to be displayed by node: https://github.com/chalk/chalk/issues/79
ENV FORCE_COLOR=1

# set default working directory
WORKDIR /app
