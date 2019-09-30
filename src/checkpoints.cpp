// Copyright (c) 2009-2012 The Bitcoin developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <boost/assign/list_of.hpp> // for 'map_list_of()'
#include <boost/foreach.hpp>

#include "checkpoints.h"

#include "txdb.h"
#include "main.h"
#include "uint256.h"


static const int nCheckpointSpan = 500;

namespace Checkpoints
{
    //
    // What makes a good checkpoint block?
    // + Is surrounded by blocks with reasonable timestamps
    //   (no blocks before with a timestamp after, none after with
    //    timestamp before)
    // + Contains no strange transactions
    //
    MapCheckpoints mapCheckpoints =
        boost::assign::map_list_of
		( 0,      uint256("0x00000bc6f02b52898ff523aa3a79250eddcd350d919c5718d4fa523de88dc9b7") )
		( 100000, uint256("0x48b8b6fa19c34daef3578cd8cdadb860418dedb22808e71bbb87cc90a52982bb") )
		( 200000, uint256("0xf491a279f3489df74ab808c6a2b44cfdae0f71af5289b765aa57e6fb3f9a4ce5") )
		( 300000, uint256("0x0e8fc834cf7b589568904396925146ca138bca96dbe6ac41391d4d1b78c74d5c") )
		( 950000, uint256("0x83546edb6e2aaf99435d725c06717e9856ade9b3dedd8e345f46d40082a4b8aa") )
	   ( 1000000, uint256("0xd1f9cfebf1748e8e5f762647134ddefc8820abf1485111a939f46d3e54d9309e") )
    ;

    // TestNet has no checkpoints
    MapCheckpoints mapCheckpointsTestnet;

    bool CheckHardened(int nHeight, const uint256& hash)
    {
        MapCheckpoints& checkpoints = (fTestNet ? mapCheckpointsTestnet : mapCheckpoints);

        MapCheckpoints::const_iterator i = checkpoints.find(nHeight);
        if (i == checkpoints.end())
            return true;
        return hash == i->second;
    }

    int GetTotalBlocksEstimate()
    {
        MapCheckpoints& checkpoints = (fTestNet ? mapCheckpointsTestnet : mapCheckpoints);

        if (checkpoints.empty())
            return 0;
        return checkpoints.rbegin()->first;
    }

    CBlockIndex* GetLastCheckpoint(const std::map<uint256, CBlockIndex*>& mapBlockIndex)
    {
        MapCheckpoints& checkpoints = (fTestNet ? mapCheckpointsTestnet : mapCheckpoints);

        BOOST_REVERSE_FOREACH(const MapCheckpoints::value_type& i, checkpoints)
        {
            const uint256& hash = i.second;
            std::map<uint256, CBlockIndex*>::const_iterator t = mapBlockIndex.find(hash);
            if (t != mapBlockIndex.end())
                return t->second;
        }
        return NULL;
    }

    CBlockThinIndex* GetLastCheckpoint(const std::map<uint256, CBlockThinIndex*>& mapBlockThinIndex)
    {
        MapCheckpoints& checkpoints = (fTestNet ? mapCheckpointsTestnet : mapCheckpoints);

        BOOST_REVERSE_FOREACH(const MapCheckpoints::value_type& i, checkpoints)
        {
            const uint256& hash = i.second;
            std::map<uint256, CBlockThinIndex*>::const_iterator t = mapBlockThinIndex.find(hash);
            if (t != mapBlockThinIndex.end())
                return t->second;
        }
        return NULL;
    }


    // Automatically select a suitable sync-checkpoint 
    const CBlockIndex* AutoSelectSyncCheckpoint()
    {
        const CBlockIndex *pindex = pindexBest;
        // Search backward for a block within max span and maturity window
        while (pindex->pprev && pindex->nHeight + nCheckpointSpan > pindexBest->nHeight)
            pindex = pindex->pprev;
        return pindex;
    }

    // Automatically select a suitable sync-checkpoint - Thin mode
    const CBlockThinIndex* AutoSelectSyncThinCheckpoint()
    {
        const CBlockThinIndex *pindex = pindexBestHeader;
        // Search backward for a block within max span and maturity window
        while (pindex->pprev && pindex->nHeight + nCheckpointSpan > pindexBest->nHeight)
            pindex = pindex->pprev;
        return pindex;
    }

    // Check against synchronized checkpoint
    bool CheckSync(int nHeight)
    {
        if(nNodeMode == NT_FULL)
        {
            const CBlockIndex* pindexSync = AutoSelectSyncCheckpoint();

            if (nHeight <= pindexSync->nHeight)
                return false;
        }
        else {
            const CBlockThinIndex *pindexSync = AutoSelectSyncThinCheckpoint();

            if (nHeight <= pindexSync->nHeight)
                return false;
        }
        return true;
    }
}
