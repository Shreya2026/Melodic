import FeaturedGridSkeleton from '@/components/skeletons/FeaturedGridSkeleton';
import { useMusicStore } from '@/stores/useMusicStore';
import PlayButton from './PlayButton';


const FeaturedSection = () => {
    const {isLoading, featuredSongs, error} = useMusicStore();

    if(isLoading) return <FeaturedGridSkeleton />
    if(error) return<p className='text-red-500 mb-4 text-lg'>Error: {error}</p>
  return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8'>
			{featuredSongs.map((song) => (
				<div
					key={song._id}
					className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
				>
					<img
						src={song.imageUrl}
						alt={song.title}
						className='w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover flex-shrink-0'
					/>
					<div className='flex-1 p-3 md:p-4 min-w-0'>
						<p className='font-medium truncate text-sm md:text-base'>{song.title}</p>
						<p className='text-xs md:text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
					 <PlayButton song={song} /> 
				</div>
			))}
		</div>
	);
}

export default FeaturedSection
