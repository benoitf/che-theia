/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import 'reflect-metadata';

import * as axios from 'axios';
import * as jsYaml from 'js-yaml';

import { V1alpha2DevWorkspace, V1alpha2DevWorkspaceTemplate } from '@devfile/api';

import { DevfileCheTheiaPluginsResolver } from './devfile/devfile-che-theia-plugins-resolver';
import { InversifyBinding } from './inversify/inversify-bindings';

const devWorkspace: V1alpha2DevWorkspace = {
  kind: 'DevWorkspace',
  apiVersion: 'workspace.devfile.io/v1alpha2',
  metadata: {
    name: 'theia-nodejs',
  },
  spec: {
    started: true,
    template: {
      components: [
        {
          container: {
            env: [
              {
                name: 'ENV_VAR',
                value: 'value',
              },
            ],
            image: 'quay.io/eclipse/che-java8-maven:nightly',
            memoryLimit: '1536M',
            sourceMapping: '/projects',
            volumeMounts: [
              {
                name: 'mavenrepo',
                path: '/root/.m2',
              },
            ],
          },
          name: 'maven',
        },
        {
          name: 'mavenrepo',
          volume: {
            size: '1G',
          },
        },
        {
          name: 'theia-ide-workspaceea5ac4ddc8354c9e',
          plugin: {
            kubernetes: {
              name: 'theia-ide-workspaceea5ac4ddc8354c9e',
              namespace: 'user1-che',
            },
          },
        },
      ],
    },
  },
};

const theiaWorkspaceTemplate: V1alpha2DevWorkspaceTemplate = {
  metadata: {
    name: 'theia-ide-workspaceea5ac4ddc8354c9e',
  },
  spec: {
    commands: [
      {
        apply: {
          component: 'remote-runtime-injector',
        },
        id: 'init-container-command',
      },
    ],
    components: [
      {
        container: {
          cpuLimit: '1500m',
          cpuRequest: '100m',
          endpoints: [
            {
              attributes: {
                cookiesAuthEnabled: true,
                discoverable: false,
                type: 'ide',
              },
              name: 'theia',
              secure: false,
              targetPort: 3100,
            },
            {
              attributes: {
                cookiesAuthEnabled: true,
                discoverable: false,
                type: 'webview',
                unique: true,
              },
              name: 'webviews',
              secure: false,
              targetPort: 3100,
            },
            {
              attributes: {
                cookiesAuthEnabled: true,
                discoverable: false,
                type: 'mini-browser',
                unique: true,
              },
              name: 'mini-browser',
              secure: false,
              targetPort: 3100,
            },
            {
              attributes: {
                discoverable: false,
                type: 'ide-dev',
              },
              name: 'theia-dev',
              targetPort: 3130,
            },
            {
              attributes: {
                discoverable: false,
              },
              name: 'theia-redirect-1',
              targetPort: 13131,
            },
            {
              attributes: {
                discoverable: false,
              },
              name: 'theia-redirect-2',
              targetPort: 13132,
            },
            {
              attributes: {
                discoverable: false,
              },
              name: 'theia-redirect-3',
              targetPort: 13133,
            },
            {
              attributes: {
                cookiesAuthEnabled: true,
                discoverable: false,
                type: 'collocated-terminal',
              },
              name: 'terminal',
              secure: false,
              targetPort: 3333,
            },
          ],
          env: [
            {
              name: 'THEIA_PLUGINS',
              value: 'local-dir:///plugins',
            },
            {
              name: 'HOSTED_PLUGIN_HOSTNAME',
              value: '0.0.0.0',
            },
            {
              name: 'HOSTED_PLUGIN_PORT',
              value: '3130',
            },
            {
              name: 'THEIA_HOST',
              value: '0.0.0.0',
            },
          ],
          image: 'quay.io/eclipse/che-theia:next',
          memoryLimit: '512M',
          mountSources: true,
          sourceMapping: '/projects',
          volumeMounts: [
            {
              name: 'plugins',
              path: '/plugins',
            },
            {
              name: 'theia-local',
              path: '/home/theia/.theia',
            },
          ],
        },
        name: 'theia-ide',
      },
      {
        name: 'plugins',
        volume: {},
      },
      {
        name: 'theia-local',
        volume: {},
      },
      {
        container: {
          command: ['/go/bin/che-machine-exec', '--url', '0.0.0.0:3333'],
          image: 'quay.io/eclipse/che-machine-exec:nightly',
          sourceMapping: '/projects',
        },
        name: 'che-machine-exec',
      },
      {
        container: {
          env: [
            {
              name: 'PLUGIN_REMOTE_ENDPOINT_EXECUTABLE',
              value: '/remote-endpoint/plugin-remote-endpoint',
            },
            {
              name: 'REMOTE_ENDPOINT_VOLUME_NAME',
              value: 'remote-endpoint',
            },
          ],
          image: 'quay.io/eclipse/che-theia-endpoint-runtime-binary:next',
          sourceMapping: '/projects',
          volumeMounts: [
            {
              name: 'remote-endpoint',
              path: '/remote-endpoint',
            },
          ],
        },
        name: 'remote-runtime-injector',
      },
      {
        name: 'remote-endpoint',
        volume: {
          ephemeral: true,
        },
      },
    ],
    events: {
      preStart: ['init-container-command'],
    },
  },
};

const devWorkspaceTemplates = [theiaWorkspaceTemplate];
const axiosInstance = axios.default;

(async (): Promise<void> => {
  const inversifyBindings = new InversifyBinding();
  const container = await inversifyBindings.initBindings({
    pluginRegistryUrl: 'https://che-plugin-registry-main.surge.sh/v3',
    enableCors: true,
    axiosInstance,
  });

  const devfileCheTheiaPluginsResolver = container.get(DevfileCheTheiaPluginsResolver);

  await devfileCheTheiaPluginsResolver.handle({
    devfileUrl: 'https://github.com/benoitf/spring-petclinic/blob/main/devfile.yaml',
    namespace: 'user1-che',
    devWorkspace,
    devWorkspaceTemplates,
  });

  // display the new stuff
  console.log('devWorkspace=');
  console.log(jsYaml.dump(devWorkspace));

  console.log('templates=');
  console.log(jsYaml.dump(devWorkspaceTemplates));
})().catch(error => console.error('Error', error));
