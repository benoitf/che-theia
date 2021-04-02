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
import { GithubResolver } from '../../src/github/github-resolver';

describe('Test GithubResolver', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    jest.resetAllMocks();
    container.bind(GithubResolver).toSelf().inSingletonScope();
  });

  test('valid github URL', async () => {
    const githubResolver = container.get(GithubResolver);
    const githubUrl = githubResolver.resolve('https://github.com/eclipse-che/che-theia');
    expect(githubUrl.getContentUrl('.che/che-theia-plugins.yaml')).toBe(
      'https://cdn.jsdelivr.net/gh/eclipse-che/che-theia@HEAD/.che/che-theia-plugins.yaml'
    );
    expect(githubUrl.getUrl()).toBe('https://github.com/eclipse-che/che-theia/tree/HEAD/');

    const githubUrl2 = githubResolver.resolve('https://github.com/eclipse-che/che-theia/blob/master/yarn.lock');
    expect(githubUrl2.getContentUrl('devfile.yaml')).toBe(
      'https://cdn.jsdelivr.net/gh/eclipse-che/che-theia@master/devfile.yaml'
    );
    expect(githubUrl2.getUrl()).toBe('https://github.com/eclipse-che/che-theia/tree/master/yarn.lock');

    const githubUrl3 = githubResolver.resolve('https://github.com/eclipse-che/che-theia/blob/7.28.0/devfile.yaml');
    expect(githubUrl3.getContentUrl('devfile.yaml')).toBe(
      'https://cdn.jsdelivr.net/gh/eclipse-che/che-theia@7.28.0/devfile.yaml'
    );
    expect(githubUrl3.getUrl()).toBe('https://github.com/eclipse-che/che-theia/tree/7.28.0/devfile.yaml');
  });

  test('invalid github URL', async () => {
    const githubResolver = container.get(GithubResolver);
    expect(() => {
      githubResolver.resolve('https://www.helloworld.com');
    }).toThrow('Invalid github URL');
    expect(() => {
      githubResolver.resolve('https://github.com/eclipse-che');
    }).toThrow('Invalid github URL');
  });
});
