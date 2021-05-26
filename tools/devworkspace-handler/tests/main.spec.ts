/**********************************************************************
 * Copyright (c) 2020-2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { InversifyBinding } from '../src/inversify/inversify-binding';
import { Main } from '../src/main';

describe('Test Main with stubs', () => {
  const FAKE_DEVFILE_URL = 'http://fake-devfile-url';
  const FAKE_OUTPUT_FILE = '/fake-output';
  const FAKE_PLUGIN_REGISTRY_URL = 'http://fake-plugin-registry-url';

  const originalConsoleError = console.error;
  const mockedConsoleError = jest.fn();
  const generateMethod = jest.fn();
  const originalArgs = process.argv;
  const selfMock = {
    inSingletonScope: jest.fn(),
  };
  const bindMock = {
    toSelf: jest.fn().mockReturnValue(selfMock),
  };
  const generateMock = {
    generate: generateMethod as any,
  };
  const container = {
    bind: jest.fn().mockReturnValue(bindMock),
    get: jest.fn().mockReturnValue(generateMock),
  } as any;
  const spyInitBindings = jest.spyOn(InversifyBinding.prototype, 'initBindings');

  function initArgs(devfileUrl: string | undefined, outputFile: string | undefined, pluginRegistryUrl: string | undefined) {
    // empty args
    process.argv = ['', ''];
    if (devfileUrl) {
      process.argv.push(`--devfile-url:${devfileUrl}`);
    }
    if (outputFile) {
      process.argv.push(`--output-file:${outputFile}`);
    }
    if (pluginRegistryUrl) {
      process.argv.push(`--plugin-registry-url:${pluginRegistryUrl}`);
    }
  }

  beforeEach(() => {
    initArgs(FAKE_DEVFILE_URL, FAKE_OUTPUT_FILE, FAKE_PLUGIN_REGISTRY_URL);
    spyInitBindings.mockImplementation(() => Promise.resolve(container));
  });

  afterEach(() => {
    process.argv = originalArgs;
    jest.restoreAllMocks();
  });

  beforeEach(() => (console.error = mockedConsoleError));
  afterEach(() => (console.error = originalConsoleError));

  test('success', async () => {
    const main = new Main();
    const returnCode = await main.start();
    expect(returnCode).toBeTruthy();
    expect(generateMethod).toBeCalledWith(FAKE_DEVFILE_URL, FAKE_OUTPUT_FILE);
    expect(mockedConsoleError).toBeCalledTimes(0);
  });

  test('missing devfile', async () => {
    const main = new Main();
    initArgs(undefined, FAKE_OUTPUT_FILE, FAKE_PLUGIN_REGISTRY_URL);
    const returnCode = await main.start();
    expect(mockedConsoleError).toBeCalled();
    expect(mockedConsoleError.mock.calls[1][1].toString()).toContain('missing --devfile-url: parameter');
    expect(returnCode).toBeFalsy();
    expect(generateMethod).toBeCalledTimes(0);
  });

  test('missing outputfile', async () => {
    const main = new Main();
    initArgs(FAKE_DEVFILE_URL, undefined, undefined);
    const returnCode = await main.start();
    expect(mockedConsoleError).toBeCalled();
    expect(mockedConsoleError.mock.calls[1][1].toString()).toContain('missing --output-file: parameter');
    expect(returnCode).toBeFalsy();
    expect(generateMethod).toBeCalledTimes(0);
  });

  test('error', async () => {
    jest.spyOn(InversifyBinding.prototype, 'initBindings').mockImplementation(() => {
      throw new Error('Dummy error');
    });
    const main = new Main();
    const returnCode = await main.start();
    expect(mockedConsoleError).toBeCalled();
    expect(returnCode).toBeFalsy();
    expect(generateMethod).toBeCalledTimes(0);
  });
});
