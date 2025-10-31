import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Input } from './ui/input'
import { Search as SearchIcon, X } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'

const getInitials = (name = '') => {
  const parts = (name || '').trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const { user } = useSelector(store => store.auth)

  // Define the consistent gradient styles
  const avatarGradientBorderClass = 'p-[2px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500'
  const searchGradientClass = 'bg-gradient-to-br from-[#d4f8b9] via-[#f7e3e9] to-[#d8b4e2]'

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const res = await axios.get(`http://localhost:8000/api/v1/user/search?query=${encodeURIComponent(query)}`, {
        withCredentials: true
      })
      
      if (res.data.success) {
        setSearchResults(res.data.users)
      }
    } catch (error) {
      console.log(error)
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Search Header */}
      <div className={`p-4 border-b border-gray-200 ${searchGradientClass}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 focus-visible:ring-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          <>
            {isSearching ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Search Results ({searchResults.length})
                </h2>
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Gradient Border for Avatar */}
                    <div className={avatarGradientBorderClass}>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={searchUser.profilePicture} alt={searchUser.username} />
                        <AvatarFallback>{getInitials(searchUser.username)}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/profile/${searchUser._id}`}
                        className="block"
                      >
                        <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                          {searchUser.username}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {searchUser.bio || 'No bio available'}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>{searchUser.posts?.length || 0} posts</span>
                          <span>{searchUser.followers?.length || 0} followers</span>
                          <span>{searchUser.following?.length || 0} following</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <SearchIcon className="w-12 h-12 mb-2" />
                <p>No users found for "{searchQuery}"</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <SearchIcon className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Search Users</h2>
            <p className="text-center max-w-md">
              Find and connect with other users by searching their username
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
