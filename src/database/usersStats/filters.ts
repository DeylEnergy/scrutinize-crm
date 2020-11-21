export default function filters({_userId}: any) {
  return {
    userId: (userStats: any) => {
      const [userId] = userStats.userIdPeriod
      return _userId === userId
    },
  }
}
