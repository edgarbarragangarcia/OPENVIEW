/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppRouter } from './router';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AppRouter />
    </>
  );
}
