import { Link } from 'react-router-dom';
import { DoodleJumpGame } from '../components/DoodleJumpGame';

export const NotFoundPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The page you are looking for does not exist. Enjoy a quick game while you're here.
      </p>

      <div className="flex justify-center mb-8">
        <DoodleJumpGame />
      </div>

      <Link
        to="/"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
      >
        &larr; Back to Deals
      </Link>
    </div>
  );
};
