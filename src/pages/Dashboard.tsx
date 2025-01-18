export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Weekly Schedule</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <AddStaffForm onClose={() => {
                  const closeButton = document.querySelector('[aria-label="Close"]');
                  if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                  }
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <main>
          <WeeklySchedule />
        </main>
      </div>
    </div>
  );
}