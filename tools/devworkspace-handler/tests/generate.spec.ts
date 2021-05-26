/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Generate } from '../src/generate';
import { UrlFetcher } from '../src/fetch/url-fetcher';
import { CheTheiaPluginsDevfileResolver } from '../src/devfile/che-theia-plugins-devfile-resolver';
import { PluginRegistryResolver } from '../src/plugin-registry/plugin-registry-resolver';
import * as fs from 'fs-extra';

describe('Test Generate', () => {
  let container: Container;

  let generate: Generate;

  const urlFetcherFetchTextMethod = jest.fn();
  const urlFetcher = {
    fetchText: urlFetcherFetchTextMethod,
  } as any;

  const cheTheiaPluginsDevfileResolverHandleMethod = jest.fn();
  const cheTheiaPluginsDevfileResolver = {
    handle: cheTheiaPluginsDevfileResolverHandleMethod
  } as any;

  const pluginRegistryResolverLoadDevfilePluginMethod = jest.fn();
  const pluginRegistryResolver = {
    loadDevfilePlugin: pluginRegistryResolverLoadDevfilePluginMethod,
  } as any;


  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    container = new Container();
    container.bind(Generate).toSelf().inSingletonScope();
    container.bind(UrlFetcher).toConstantValue(urlFetcher);
    container.bind(CheTheiaPluginsDevfileResolver).toConstantValue(cheTheiaPluginsDevfileResolver);
    container.bind(PluginRegistryResolver).toConstantValue(pluginRegistryResolver);
    generate = container.get(Generate);
  });

  test('basics', async () => {
    pluginRegistryResolverLoadDevfilePluginMethod.mockResolvedValue({
      schemaVersion: '2.1.0',
      metadata: {
  name: 'theia-ide'
      },
commands:[]})

      const devfileUrl = 'http://my-devfile-url';
      const fakeoutputDir = '/fake-output';

      const fsWriteFileSpy = jest.spyOn(fs, 'writeFile');
      fsWriteFileSpy.mockReturnValue();

    await generate.generate(devfileUrl, fakeoutputDir);
    expect(urlFetcherFetchTextMethod).toBeCalledWith(devfileUrl);

    // expect to write the file
      expect(fsWriteFileSpy).toBeCalled();
  });
});
