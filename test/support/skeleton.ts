import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from '@creatortsv/pkg-ui';

/**
 * The first class of the pkg-ui `Skeleton`, the marker of a loading frame (the same marker as
 * `pagesInitialState.test.tsx`). Imported only by the DOM tests, so node-only tests never load it.
 */
export const SKELETON_CLASS: string = renderToStaticMarkup(createElement(Skeleton)).split('class="')[1].split(' ')[0];
