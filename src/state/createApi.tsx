import React from "react";
import { createState } from "./createState";


interface ApiResponse<TRequest, TResponse> {
  data?: TResponse;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>
  trigger: (params: TRequest) => Promise<void>
}

type ApiBuilderConfig = {
  baseUrl: string;
  prepareHeader?: (headers: Headers) => void
};

interface EndpointBuild {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

interface EndpointConfig<TRequest, TResponse> {
  build: (params: TRequest) => EndpointBuild;
  tags?: string[];
  invalidTags?: string[];
}

type FetchHookSetting = {
  skip?: boolean
};

type TagEndpointType = { url: string, refetch: () => Promise<void>; };

let globalTags: { [x: string]: Set<any>; } = {};

export const invalidateTags = (tagsToInvalidate: any[]) => {
  tagsToInvalidate.forEach((tag: string) => {
    const endpoints = globalTags[tag];
    if (endpoints) {
      endpoints.forEach((endpoint: { refetch: () => any; }) => endpoint.refetch());
    }
  });
};

const registerEndpointWithTag = (tag: string, endpoint: TagEndpointType) => {
  if (!globalTags[tag]) {
    globalTags[tag] = new Set<TagEndpointType>();
  }

  const end = globalTags[tag];
  let found = false;
  end?.forEach((v: TagEndpointType) => {

    if (found)
      return

    if (v.url === endpoint.url) {
      found = true;
    }
  })
  
  if (!found) {
    globalTags[tag].add(endpoint);
  }
};

export const useInvalidateTags = () => {
    return React.useCallback((tags: string[]) => {
      invalidateTags(tags);
    }, []);
  };

// The builder function that sets up the API configuration and generates endpoints
export function createApiBuilder({ baseUrl, prepareHeader }: ApiBuilderConfig) {
  function endpoint<TRequest, TResponse>(config: EndpointConfig<TRequest, TResponse>) {

    const endpointState = createState<Record<string, ApiResponse<TRequest, TResponse>>>({});

    const fetchAndCacheData = async (params: TRequest, signal?: AbortSignal) => {
      const build = config.build(params)
      const url = `${baseUrl}${build.path}`;

      endpointState.set(s => ({
          ...s,
          [url]: {
            ...s[url],
            isLoading: true,
            error: null,
          }
      }));

      // Check cache first
      const cachedData = endpointState.get()?.[url].data;
      if (cachedData) {
        // If data is cached, use it
        endpointState.set(s => ({
          ...s,
          [url]: {
            ...s[url],
            isLoading: false,
            data: cachedData
          }
        }));
      } else {
        // Fetch new data and update the state
        try {
          let headers: Headers = new Headers()
          headers.set('Content-Type', 'application/json');

          prepareHeader?.(headers)
          const promise = fetch(url, {
            method: build.method,
            body: build.body ? JSON.stringify(build.body) : undefined,
            headers,
            signal
          });
          const result = await promise;
          const respData: TResponse = await result.json()

          endpointState.set(s => ({
            ...s,
            [url]: {
              ...s[url],
              isLoading: false,
              data: respData
            }
          }));
          
          config.tags?.forEach(tag => registerEndpointWithTag(tag, {
              url,
              refetch: async () => endpointState.get()?.[url]?.refetch()
            })
          );

          if (config.invalidTags)
            invalidateTags(config.invalidTags);
        } catch (error: any) {
          endpointState.set(s => ({
            ...s,
            [url]: {
              ...s[url],
              isLoading: false,
              error
            }
          }));
        }
      }
    };

    const refetchFn = async (params: TRequest, hookConfig?: FetchHookSetting) => {
      const build = config.build(params)
      const url = `${baseUrl}${build.path}`
      endpointState.set(s => ({
        ...s,
        [url]: {
          ...s[url],
          data: undefined
        }
      }));
      return fetchAndCacheData(params)
    }

    const hookFn = function useApi(params: TRequest, hookConfig?: FetchHookSetting): ApiResponse<TRequest, TResponse> {
      React.useEffect(() => {
        const build = config.build(params)
        const url = `${baseUrl}${build.path}`
        endpointState.set(s => ({
          ...s,
          [url]: {
            ...s[url],
            refetch: async () => refetchFn(params, hookConfig),
            trigger: async (params: TRequest) => {
              return fetchAndCacheData(params);
            },
          }
        }));
      
        if (build.method && build.method !== 'GET')
          return
        if (hookConfig?.skip)
          return

        const controller = new AbortController();
        const signal = controller.signal;

        fetchAndCacheData(params, signal);

        return () => {
          controller.abort();
        };
      }, [hookConfig?.skip]);

      return endpointState.use(s => {
        const build = config.build(params)
        const url = `${baseUrl}${build.path}`
        const end =  s[url]
        return {
          ...end,
          data: end?.data ?? undefined,
          error: end?.error ?? null,
          isLoading: end?.isLoading ?? false,
          trigger: end?.trigger ?? (async () => {}),
          refetch: end?.refetch ?? (async () => {}),
        }
      })
    };

    const initiate = async (params: TRequest) => {
      const build = config.build(params)
      const url = `${baseUrl}${build.path}`;
      if (!endpointState.get()?.[url]?.isLoading) {
        await fetchAndCacheData(params)
      }

      const end = endpointState.get()?.[url];
      return {
        ...end,
        data: end?.data ?? undefined,
        error: end?.error ?? null,
        isLoading: end?.isLoading ?? false,
        trigger: end?.trigger ?? (async () => {}),
        refetch: end?.refetch ?? (async () => {}),
      }
    }

    return {
      use: hookFn,
      initiate
    }
  }


  // function mutation<TRequest, TResponse>(config: EndpointConfig<TRequest, TResponse>) {

  //   const endpointState = createState<Record<string, ApiMutationResponse<TRequest, TResponse>>>({});

  //   const fetchAndCacheData = async (params: TRequest, hookConfig?: FetchHookSetting, signal?: AbortSignal) => {
  //     if (hookConfig?.skip)
  //       return

  //     const url = `${baseUrl}${config.path(params)}`;

  //     endpointState.set(s => ({
  //         ...s,
  //         [url]: {
  //           ...s[url],
  //           isLoading: true,
  //           error: null
  //         }
  //     }));

  //     // Check cache first
  //     const cachedData = endpointState.get()?.[url].data;
  //     if (cachedData) {
  //       // If data is cached, use it
  //       endpointState.set(s => ({
  //         ...s,
  //         [url]: {
  //           ...s[url],
  //           isLoading: false,
  //           data: cachedData
  //         }
  //       }));
  //     } else {
  //       // Fetch new data and update the state
  //       try {
  //         let headers: Headers = new Headers()
  //         config.prepareHeader?.(headers)
  //         const promise = fetch(url, { method: config.method, headers, signal });
  //         const result = await promise;
  //         const respData: TResponse = await result.json()

  //         endpointState.set(s => ({
  //           ...s,
  //           [url]: {
  //             ...s[url],
  //             isLoading: false,
  //             data: respData,
  //             refetch: () => {
  //               endpointState.set(s => ({
  //                 ...s,
  //                 [url]: {
  //                   ...s[url],
  //                   data: undefined
  //                 }
  //               }));
  //               return fetchAndCacheData(params, hookConfig)
  //             }
  //           }
  //         }));

  //         if (config.invalidTags)
  //           invalidateTags(config.invalidTags);
          
  //         config.tags?.forEach(tag => registerEndpointWithTag(tag, {
  //             url,
  //             refetch: async () => endpointState.get()?.[url]?.refetch()
  //           })
  //         );
  //       } catch (error: any) {
  //         endpointState.set(s => ({
  //           ...s,
  //           [url]: {
  //             ...s[url],
  //             isLoading: false,
  //             error
  //           }
  //         }));
  //       }
  //     }
  //   };

  //   const hookFn = function useApi(params: TRequest, hookConfig?: FetchHookSetting): ApiMutationResponse<TRequest, TResponse> {
  //     React.useEffect(() => {
  //       const controller = new AbortController();
  //       const signal = controller.signal;

  //       fetchAndCacheData(params, hookConfig, signal);

  //       return () => {
  //         controller.abort();
  //       };
  //     }, [hookConfig?.skip]);

  //     return endpointState.use(s => {

  //       const end =  s[`${baseUrl}${config.path(params)}`]
  //       return {
  //         ...end,
  //         data: end?.data ?? undefined,
  //         error: end?.error ?? null,
  //         isLoading: end?.isLoading ?? false,
  //         trigger: async (params: TRequest) => fetchAndCacheData(params, hookConfig)
  //       }
  //     })
  //   };

  //   hookFn.initiate = async (params: TRequest) => {
  //     const url = `${baseUrl}${config.path(params)}`;
  //     if (endpointState.get()?.[url]?.isLoading === false) {
  //       await fetchAndCacheData(params)
  //     }

  //     const end = endpointState.get()?.[`${baseUrl}${config.path(params)}`];
  //     return {
  //       ...end,
  //       data: end?.data ?? undefined,
  //       error: end?.error ?? null,
  //       isLoading: end?.isLoading ?? false,
  //       trigger: async (params: TRequest) => fetchAndCacheData(params)
  //     }
  //   }

  //   return hookFn
  // }

  return { endpoint };
}

