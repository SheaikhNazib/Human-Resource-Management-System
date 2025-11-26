const getDateExamples = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    return {
        endDate: today.toISOString().split('T')[0],
        startDate: sevenDaysAgo.toISOString().split('T')[0],
    };
};

export { getDateExamples };